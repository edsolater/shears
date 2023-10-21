import { Box, Text } from '../../packages/pivkit';


export function AppLogo(props: { title: string | undefined; }) {
  return (
    <Box
      icss={{
        display: 'flex',
        gap: '64px',
      }}
    >
      <Text
        icss={{
          fontSize: '36px',
          fontWeight: '800',
        }}
      >
        {props.title}
      </Text>
      {/* <Piv shadowProps={{ children: props.title }} /> */}
    </Box>
  );
}
