import React from 'react';
import { SearchInput } from '@patternfly/react-core';

interface SearchComponentProps {
    /* Indicates if search compoonent should be visible or not. */
    searchEnabled?: boolean
}

export const SearchComponent : React.FunctionComponent<SearchComponentProps> = ({searchEnabled = true}) => {
    const [searchValue, setSearchValue] = React.useState('');
    const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

    //TODO: Add search for algolia or alternative search to this component.

    const onChange = (_evt: any, value: any) => {
        setSearchValue(value);
    };
    
    const onToggleExpand = (_evt: any, isSearchExpanded: boolean) => {
        setIsSearchExpanded(!isSearchExpanded);
    };
    
    
    return (
       searchEnabled && <SearchInput
        className="ws-global-search"
        placeholder="Search"
        value={searchValue}
        onChange={onChange}
        onClear={(_evt) => onChange(_evt, '')}
        expandableInput={{
            isExpanded: isSearchExpanded,
            onToggleExpand,
            toggleAriaLabel: 'Expandable search input toggle'
        }}
        />
    )
}