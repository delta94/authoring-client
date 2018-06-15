import { connect } from 'react-redux';
import ContiguousTextEditor from './ContiguousTextEditor';
import { insertParsedContent } from 'actions/active';
import { ParsedContent } from 'data/parsers/common/types';

interface StateProps {

}

interface DispatchProps {
  onInsertParsedContent: (resourcePath: string, content: ParsedContent) => void;
}

interface OwnProps {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch, getState): DispatchProps => {

  return {
    onInsertParsedContent: (
      resourcePath: string, content: ParsedContent) =>
        dispatch(insertParsedContent(resourcePath, content)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(ContiguousTextEditor);

export { controller as ContiguousTextEditor };
