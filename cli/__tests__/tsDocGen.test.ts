/** @jest-environment node */
import { readFile } from 'fs/promises'
import { tsDocgen } from '../tsDocGen'

jest.mock('fs/promises', () => ({ readFile: jest.fn() }))

it('extracts a forwarded component and its exported base without losing props', async () => {
  ;(readFile as jest.Mock).mockResolvedValue(`
    import React, { forwardRef } from 'react';
    export interface InputGroupProps {
      /** Content in the input group */
      children: React.ReactNode;
      /** @hide Internal ref */
      innerRef?: React.Ref<HTMLDivElement>;
    }
    export const InputGroupBase = ({ children, innerRef }: InputGroupProps) =>
      <div ref={innerRef}>{children}</div>;
    InputGroupBase.displayName = 'InputGroupBase';
    export const InputGroup = forwardRef((props: InputGroupProps, ref: React.Ref<HTMLDivElement>) =>
      <InputGroupBase {...props} innerRef={ref} />);
    InputGroup.displayName = 'InputGroup';
  `)

  const result = await tsDocgen('InputGroup.tsx')
  for (const name of ['InputGroupBase', 'InputGroup']) {
    const component = result.find((item) => item.name === name)
    expect(component?.props).toEqual([
      expect.objectContaining({ name: 'children', required: true, description: 'Content in the input group' }),
    ])
  }
})

it('extracts multiple documented components exported from one file', async () => {
  ;(readFile as jest.Mock).mockResolvedValue(`
    import React from 'react';
    interface FooterProps { label: string }
    interface WrapperProps { children: React.ReactNode }
    export const Footer = ({ label }: FooterProps) => <footer>{label}</footer>;
    export const Wrapper = ({ children }: WrapperProps) => <div>{children}</div>;
    Footer.displayName = 'Footer';
    Wrapper.displayName = 'Wrapper';
  `)

  const result = await tsDocgen('Footer.tsx')
  expect(result.find((item) => item.name === 'Footer')?.props).toEqual([
    expect.objectContaining({ name: 'label', type: 'string', required: true }),
  ])
  expect(result.find((item) => item.name === 'Wrapper')?.props).toEqual([
    expect.objectContaining({ name: 'children', required: true }),
  ])
})
