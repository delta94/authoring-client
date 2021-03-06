import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { Toast, Severity } from 'components/common/Toast';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './ResourceLoading.styles';

export interface ResourceLoadingProps {
  className?: string;
}

/**
 * ResourceLoading React Stateless Component
 */
const ResourceLoading:
React.StatelessComponent<StyledComponentProps<ResourceLoadingProps, typeof styles>> = ({
  className, classes, children,
}) => {
  const waitingIcon = <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />;
  const waitingHeading = 'Please wait';
  const waitingContent = <p>We're loading the course material.</p>;

  return (
    <div className="waiting-notification scale-in-center">
      <Toast
        className={classNames(['ResourceLoading', classes.ResourceLoading])}
        icon={waitingIcon}
        heading={waitingHeading}
        content={waitingContent}
        severity={Severity.Waiting} />
    </div>
  );
};

const StyledResourceLoading = withStyles<ResourceLoadingProps>(styles)(ResourceLoading);
export { StyledResourceLoading as ResourceLoading };
