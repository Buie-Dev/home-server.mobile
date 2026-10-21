jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    NativeViewGestureHandler: View,
    ScrollView: require('react-native').ScrollView,
    FlatList: require('react-native').FlatList,
    TouchableOpacity: require('react-native').TouchableOpacity,
    TouchableHighlight: require('react-native').TouchableHighlight,
    TouchableWithoutFeedback: require('react-native').TouchableWithoutFeedback,
    Directions: {},
    gestureHandlerRootHOC: jest.fn((component: any) => component),
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-draggable-flatlist', () => {
  const {FlatList} = require('react-native');
  return {
    __esModule: true,
    default: FlatList,
    ScaleDecorator: require('react-native').View,
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
    },
  };
});
