import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type Props = React.ComponentProps<typeof Ionicons>;
export default function Icon(props: Props) {
  return <Ionicons {...props} />;
}
