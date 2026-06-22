export type DropdownMenuIcon = 'box' | 'truck' | 'heart' | 'sign-in' | 'sign-out';

export interface DropdownMenuItem {
  label: string;
  icon?: DropdownMenuIcon;
  action?: () => void;
}
