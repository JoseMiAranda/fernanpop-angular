export type DropdownMenuIcon = 'box' | 'truck' | 'heart' | 'user' | 'sign-in' | 'sign-out';

export interface DropdownMenuItem {
  label: string;
  icon?: DropdownMenuIcon;
  action?: () => void;
}
