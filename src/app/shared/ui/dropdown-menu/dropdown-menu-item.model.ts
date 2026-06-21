export type DropdownMenuIcon = 'box' | 'truck' | 'sign-in' | 'sign-out';

export interface DropdownMenuItem {
  label: string;
  icon?: DropdownMenuIcon;
  action?: () => void;
}
