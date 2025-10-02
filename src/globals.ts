export const tabsDictionary: any = {};

export const tabNames: any = {
  'react': 'React',
  'react-demos': 'React demos',
  'react-deprecated': 'React deprecated',
  'html': 'HTML',
  'html-demos': 'HTML demos'
};

export const buildTab = (entry: any, tab: string) => {
  const tabEntry = tabsDictionary[entry.data.id]

  // if no dictionary entry exists, and tab data exists
  if(tabEntry === undefined && tab) { 
    tabsDictionary[entry.data.id] = [tab]
  // if dictionary entry & tab data exists, and entry does not include tab
  } else if (tabEntry && tab && !tabEntry.includes(tab)) { 
    tabsDictionary[entry.data.id] = [...tabEntry, tab];
  }
}

export const sortTabs = () => {
  const defaultOrder = 50;
  const sourceOrder: any = {
    react: 1,
    'react-next': 1.1,
    'react-demos': 2,
    'react-deprecated': 2.1,
    html: 3,
    'html-demos': 4,
    'design-guidelines': 99,
    'accessibility': 100,
    'upgrade-guide': 101,
    'release-notes': 102,
  };
  
  const sortSources = (s1: string, s2: string) => {
    const s1Index = sourceOrder[s1] || defaultOrder;
    const s2Index = sourceOrder[s2] || defaultOrder;
    if (s1Index === defaultOrder && s2Index === defaultOrder) {
      return s1.localeCompare(s2);
    }
  
    return s1Index > s2Index ? 1 : -1;
  }
  
  // Sort tabs entries based on above sort order
  // Ensures all tabs are displayed in a consistent order & which tab gets displayed for a component route without a tab 
  Object.values(tabsDictionary).map((tabs: any) => {
    tabs.sort(sortSources)
  })
}