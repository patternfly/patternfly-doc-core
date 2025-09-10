import { readFile } from 'fs/promises'
import { parse } from 'react-docgen'
import ts from 'typescript'

const annotations = [
  {
    regex: /@deprecated/,
    name: 'deprecated',
    type: 'Boolean',
  },
  {
    regex: /@hide/,
    name: 'hide',
    type: 'Boolean',
  },
  {
    regex: /@beta/,
    name: 'beta',
    type: 'Boolean',
  },
  {
    regex: /@propType\s+(.*)/,
    name: 'type',
    type: 'String',
  },
]

function addAnnotations(prop) {
  if (prop.description) {
    annotations.forEach(({ regex, name }) => {
      const match = prop.description.match(regex)
      if (match) {
        prop.description = prop.description.replace(regex, '').trim()
        if (name) {
          prop[name] = match[2] || match[1] || true
        }
      }
    })
  }

  return prop
}

function getComponentMetadata(filename, sourceText) {
  let parsedComponents = null
  try {
    parsedComponents = parse(sourceText, { filename })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    // console.warn(`No component found in ${filename}:`, err);
  }

  return (parsedComponents || []).filter(
    (parsed) => parsed && parsed.displayName,
  )
}

const getNodeText = (node, sourceText) => {
  if (!node || !node.pos || !node.end) {
    return undefined
  }

  return sourceText.substring(node.pos, node.end).trim()
}

const buildJsDocProps = (nodes, sourceText) =>
  nodes?.reduce((acc, member) => {
    const name =
      (member.name && member.name.escapedText) ||
      (member.parameters &&
        `[${getNodeText(member.parameters[0], sourceText)}]`) ||
      'Unknown'
    acc[name] = {
      description: member.jsDoc
        ? member.jsDoc.map((doc) => doc.comment).join('\n')
        : null,
      required: member.questionToken === undefined,
      type: {
        raw: getNodeText(member.type, sourceText).trim(),
      },
    }
    return acc
  }, {})

const getSourceFileStatements = (filename, sourceText) => {
  const { statements } = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest, // languageVersion
  )

  return statements
}

const getInterfaceMetadata = (filename, sourceText) =>
  getSourceFileStatements(filename, sourceText).reduce(
    (metaDataAcc, statement) => {
      if (statement.kind === ts.SyntaxKind.InterfaceDeclaration) {
        const _statement = statement
        metaDataAcc.push({
          displayName: _statement.name.escapedText,
          description: _statement.jsDoc?.map((doc) => doc.comment).join('\n'),
          props: buildJsDocProps(_statement.members, sourceText),
        })
      }

      return metaDataAcc
    },
    [],
  )

const getTypeAliasMetadata = (filename, sourceText) =>
  getSourceFileStatements(filename, sourceText).reduce(
    (metaDataAcc, statement) => {
      if (statement.kind === ts.SyntaxKind.TypeAliasDeclaration) {
        const _statement = statement
        const props = _statement.type.types?.reduce((propAcc, type) => {
          if (type.members) {
            propAcc.push(buildJsDocProps(type.members, sourceText))
          }

          return propAcc
        }, [])

        metaDataAcc.push({
          props,
          displayName: _statement.name.escapedText,
          description: _statement.jsDoc?.map((doc) => doc.comment).join('\n'),
        })
      }

      return metaDataAcc
    },
    [],
  )

function extractEnumValues(typeString) {
  if (!typeString || typeof typeString !== 'string') {
    return []
  }
  
  // Handle union types like 'primary' | 'secondary' | 'tertiary'
  if (typeString.includes('|')) {
    return typeString
      .split('|')
      .map(value => value.trim())
      .filter(value => value.startsWith("'") || value.startsWith('"'))
      .map(value => value.slice(1, -1)) // Remove quotes
      .filter(value => value.length > 0)
  }
  
  return []
}

function normalizeProp([
  name,
  { required, annotatedType, type, tsType, description, defaultValue },
]) {
  const typeString = 
    annotatedType ||
    (type && type.name) ||
    (type && (type.raw || type.name)) ||
    (tsType && (tsType.raw || tsType.name)) ||
    'No type info'
    
  const res = {
    name,
    type: typeString,
    description,
  }
  
  // Extract enum values for union types
  const enumValues = extractEnumValues(typeString)
  if (enumValues.length > 0) {
    res.enumValues = enumValues
  }
  
  if (required) {
    res.required = true
  }
  if (defaultValue && defaultValue.value) {
    res.defaultValue = defaultValue.value
  }

  return res
}

export async function tsDocgen(file) {
  const sourceText = await readFile(file, 'utf8')
  const componentMeta = getComponentMetadata(file, sourceText) // Array of components with props
  const interfaceMeta = getInterfaceMetadata(file, sourceText) // Array of interfaces with props
  const typeAliasMeta = getTypeAliasMetadata(file, sourceText) // Array of type aliases with props
  const propsMetaMap = [...interfaceMeta, ...typeAliasMeta].reduce(function (
    target,
    interfaceOrTypeAlias,
  ) {
    target[interfaceOrTypeAlias.displayName] = interfaceOrTypeAlias
    return target
  }, {})

  // Go through each component and check if they have an interface or type alias with a jsDoc description
  // If so copy it over (fix for https://github.com/patternfly/patternfly-react/issues/7612)
  componentMeta.forEach((c) => {
    if (c.description) {
      return c
    }

    const propsName = `${c.displayName}Props`
    if (propsMetaMap[propsName]?.description) {
      c.description = propsMetaMap[propsName].description
    }
  })

  return [...componentMeta, ...interfaceMeta, ...typeAliasMeta].map(
    (parsed) => ({
      name: parsed.displayName,
      description: parsed.description || '',
      props: Object.entries(parsed.props || {})
        .map(normalizeProp)
        .map(addAnnotations)
        .filter((prop) => !prop.hide)
        .sort((p1, p2) => p1.name.localeCompare(p2.name)),
    }),
  )
}
