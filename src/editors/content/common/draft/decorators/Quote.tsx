import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';

class Quote extends React.PureComponent<any, any> {

  render() : JSX.Element {
    return (
      <q data-offset-key={this.props.offsetKey}>
        {this.props.children}
      </q>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.quote),
    component: Quote,
    props,
  };
}