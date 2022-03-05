import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';

type Item = {
  id: string,
  path: string,
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>
}

export const navItems: Item[] = [
  { id: 'Home', path: '/', Icon: HomeIcon },
  { id: 'Library', path: '/library', Icon: MenuBookIcon },
  { id: 'Settings', path: '/settings', Icon: SettingsIcon }
];

export default navItems;
