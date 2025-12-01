import { createTheme, alpha, Palette, PaletteOptions } from '@mui/material/styles';
import { 
  blue, grey, indigo, teal, deepOrange, 
  amber, deepPurple, cyan, common 
} from '@mui/material/colors';
declare module '@mui/material/styles' {
  interface TypeBackground {
    level1?: string;
    level2?: string;
  }

  interface Palette {
    background: TypeBackground;
  }

  interface PaletteOptions {
    background?: Partial<TypeBackground>;
  }
}
export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light Theme - Professional Corporate
            primary: {
              main: indigo[800],
              light: '#D0D9FF',
              // light: indigo[100],
              dark: indigo[900],
              contrastText: common.white,
            },
            secondary: {
              main: teal[600],
              light: teal[400],
              dark: teal[800],
            },
            background: {
              default: '#f8fafc', // Soft blue-gray
              paper: common.white,
              level1: '#f0f4f8', // Very subtle blue tint
              level2: '#e3e8f0', // For cards/containers
            },
            text: {
              primary: '#1e293b', // Deep navy blue
              secondary: '#475569', // Medium slate
              disabled: '#94a3b8', // Light slate
            },
            divider: '#e2e8f0', // Very light blue-gray
            success: {
              main: teal[600],
            },
            warning: {
              main: amber[700],
            },
            error: {
              main: deepOrange[700],
            },
            info: {
              main: cyan[600],
            },
          }
        : {
            // Dark Theme - Sophisticated Midnight
            primary: {
              main: indigo[300],
              light: indigo[200],
              dark: indigo[400],
              contrastText: common.black,
            },
            secondary: {
              main: teal[300],
              light: teal[200],
              dark: teal[400],
            },
            background: {
              default: '#0d1117', // Deep blue-black
              paper: '#1a2028ff', // Dark blue-gray
              level1: '#1a2029', // For elevated surfaces
              level2: '#212b36', // For cards/containers
            },
            text: {
              primary: '#f0f6fc', // Soft white
              secondary: '#c9d1d9', // Light gray
              disabled: '#8b949e', // Medium gray
            },
            divider: '#30363d', // Dark gray
            success: {
              main: teal[400],
            },
            warning: {
              main: amber[500],
            },
            error: {
              main: deepOrange[500],
            },
            info: {
              main: cyan[400],
            },
          }),
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: `'Inter', 'Segoe UI', 'Helvetica', 'Arial', sans-serif`,
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        letterSpacing: '-0.5px',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.25px',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      body1: {
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        letterSpacing: 0.5,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light' 
                ? `0 4px 12px ${alpha(indigo[100], 0.8)}` 
                : `0 4px 12px rgba(0, 0, 0, 0.6)`,
            },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'light' 
                ? `0 4px 10px ${alpha(indigo[200], 0.5)}` 
                : `0 4px 12px rgba(99, 102, 241, 0.3)`,
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
              backgroundColor: mode === 'light' 
                ? alpha(indigo[50], 0.5)
                : alpha(indigo[900], 0.2),
            },
          },
          text: {
            '&:hover': {
              backgroundColor: mode === 'light' 
                ? alpha(indigo[50], 0.5)
                : alpha(indigo[900], 0.2),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 4px 20px rgba(0, 0, 0, 0.05)'
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            backgroundColor: mode === 'light' 
              ? 'background.level2' 
              : 'background.level2',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: mode === 'light'
                ? '0 8px 30px rgba(0, 0, 0, 0.1)'
                : '0 8px 30px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid #30363d' : '1px solid #e2e8f0',
            backgroundColor: mode === 'light' 
              ? 'background.level2' 
              : 'background.level2',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#161b22',
            color: mode === 'light' ? '#1e293b' : '#f0f6fc',
            borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #30363d',
            boxShadow: mode === 'light' 
              ? '0 2px 10px rgba(0, 0, 0, 0.05)' 
              : '0 2px 10px rgba(0, 0, 0, 0.3)',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '&:hover:not(.Mui-disabled)': {
              '&:before': {
                borderBottom: `2px solid ${mode === 'light' ? indigo[400] : indigo[300]}`,
              },
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: mode === 'light' ? indigo[700] : indigo[200],
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#e2e8f0' : '#30363d',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'light' 
                ? alpha(indigo[50], 0.7) 
                : alpha(indigo[900], 0.2),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'light' 
                ? alpha(indigo[50], 0.5) 
                : alpha(indigo[900], 0.2),
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            transition: 'color 0.2s ease',
            '&:hover': {
              color: mode === 'light' ? indigo[700] : indigo[200],
            },
          },
        },
      },
    },
  });