import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';

export default function Filters() {
  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger
        render={<Button variant="secondary" type='button'>Open Drawer</Button>}
      />

      <DrawerContent>
        <p>Hello! This is my drawer.</p>
      </DrawerContent>
    </Drawer>
  );
}