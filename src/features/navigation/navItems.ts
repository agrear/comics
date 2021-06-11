import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import HomeIcon from '@material-ui/icons/Home';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import SettingsIcon from '@material-ui/icons/Settings';

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
