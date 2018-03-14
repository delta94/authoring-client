import { JSSProps } from 'styles/jss';

export type ComponentProps<P> = P & React.Attributes
  & { className?: boolean; children?: React.ReactNode };

export type StyledComponentProps<P> = ComponentProps<P> & JSSProps;
