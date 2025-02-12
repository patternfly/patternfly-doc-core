export type Theme = 'dark' | 'light' | 'system';

export const updateThemePreference = (theme: Theme) => {
   if(typeof window !== undefined) { 
        window?.localStorage?.setItem('theme-preference', theme)
        document?.querySelector('html')?.classList.toggle('pf-v6-theme-dark', theme === 'dark' );     
   };
};
export const getThemePreference =  (): Theme => { 
    const theme =  window?.localStorage?.getItem ('theme-preference');
    return theme !== undefined ? (theme as Theme) : 'system'; 
};

export const themeLoader = () => {
    if(typeof window !== 'undefined') {   
        window.addEventListener('DOMContentLoaded', ()=>  {
            updateThemePreference(getThemePreference());    
        })
    };
}