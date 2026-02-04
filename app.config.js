import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        '@mj-studio/react-native-naver-map',
        {
          client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID,
        },
      ],
    ],
  };
};
