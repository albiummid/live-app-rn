import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';
import MainStack from './navigators/MainStack';
export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'tomato',
      secondary: 'yellow',
    },
  };
  return (
    <PaperProvider theme={theme}>
      <MainStack />
    </PaperProvider>
  );
}
