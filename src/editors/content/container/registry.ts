import { connectEditor, connectPopupEditor } from './connectEditor';
import CodeBlockEditor from '../learning/CodeBlockEditor';
import ExampleEditor from '../learning/ExampleEditor';
import FigureEditor from '../learning/FigureEditor';
import PulloutEditor from '../learning/PulloutEditor';
import SectionEditor from '../learning/SectionEditor';
import WbInlineEditor from '../learning/WbInlineEditor';
import ActivityEditor from '../learning/ActivityEditor';
import BlockCodeEditor from '../learning/blockcode/BlockCodeEditor';
import BlockFormulaEditor from '../learning/blockformula/BlockFormulaEditor';
import ContiguousTextEditor from '../learning/contiguoustext/ContiguousTextEditor';
import CustomEditor from '../learning/CustomEditor';
import UnsupportedEditor from '../learning/UnsupportedEditor';
import LinkEditor from '../learning/LinkEditor';
import ActivityLinkEditor from '../learning/ActivityLinkEditor';
import BlockQuoteEditor from '../learning/blockquote/BlockQuoteEditor';
import MathEditor from '../learning/MathEditor';
import ParamEditor from '../learning/ParamEditor';
import CiteEditor from '../learning/CiteEditor';
import XrefEditor from '../learning/XrefEditor';
import ImageEditor from '../learning/ImageEditor';
import AudioEditor from '../learning/AudioEditor';
import VideoEditor from '../learning/VideoEditor';
import DirectorEditor from '../learning/DirectorEditor';
import AppletEditor from '../learning/AppletEditor';
import FlashEditor from '../learning/FlashEditor';
import MathematicaEditor from '../learning/MathematicaEditor';
import PanoptoEditor from '../learning/PanoptoEditor';
import UnityEditor from '../learning/UnityEditor';
import IFrameEditor from '../learning/IFrameEditor';
import YouTubeEditor from '../learning/YouTubeEditor';
import OrderedListEditor from '../learning/OrderedListEditor';
import UnorderedListEditor from '../learning/UnorderedListEditor';
import ListItemEditor from '../learning/ListItemEditor';
import TableEditor from '../learning/table/TableEditor';
import CellEditor from '../learning/table/CellEditor';
import DefinitionEditor from '../learning/DefinitionEditor';
import MeaningEditor from '../learning/MeaningEditor';
import TranslationEditor from '../learning/TranslationEditor';
import PronunciationEditor from '../learning/PronunciationEditor';
import HintEditor from '../part/HintEditor';
import QuoteEditor from '../learning/QuoteEditor';
import MaterialsEditor from '../learning/MaterialsEditor';
import MaterialEditor from '../learning/MaterialEditor';
import CompositeEditor from '../learning/CompositeEditor';
import InstructionsEditor from '../learning/InstructionsEditor';
import AlternativesEditor from '../learning/AlternativesEditor';
import AlternativeEditor from '../learning/AlternativeEditor';
import DialogEditor from 'editors/content/learning/dialog/DialogEditor';
import SpeakerEditor from 'editors/content/learning/dialog/SpeakerEditor';
import LineEditor from 'editors/content/learning/dialog/LineEditor';
import ExtraDefinitionEditor from 'editors/content/learning/ExtraDefinitionEditor';


let registry = null;

export function getEditorByContentType(contentType: string) {

  if (registry === null) {
    init();
  }

  const component = registry[contentType];
  return component !== undefined ? component : UnsupportedEditor;
}

function init() {
  registry = {};
  registry['Hint'] = HintEditor;
  registry['ContiguousText'] = connectEditor(ContiguousTextEditor);
  registry['CodeBlock'] = connectEditor(CodeBlockEditor);
  registry['Custom'] = connectEditor(CustomEditor);
  registry['Dialog'] = connectEditor(DialogEditor);
  registry['Speaker'] = connectEditor(SpeakerEditor);
  registry['Line'] = connectEditor(LineEditor);
  registry['Director'] = connectEditor(DirectorEditor);
  registry['Applet'] = connectEditor(AppletEditor);
  registry['Flash'] = connectEditor(FlashEditor);
  registry['Mathematica'] = connectEditor(MathematicaEditor);
  registry['Panopto'] = connectEditor(PanoptoEditor);
  registry['Unity'] = connectEditor(UnityEditor);
  registry['Param'] = connectEditor(ParamEditor);
  registry['Extra'] = connectPopupEditor(ExtraDefinitionEditor);
  registry['Link'] = connectEditor(LinkEditor);
  registry['Image'] = connectEditor(ImageEditor);
  registry['ActivityLink'] = connectEditor(ActivityLinkEditor);
  registry['BlockQuote'] = connectEditor(BlockQuoteEditor);
  registry['Quote'] = connectEditor(QuoteEditor);
  registry['Math'] = connectEditor(MathEditor);
  registry['Cite'] = connectEditor(CiteEditor);
  registry['Xref'] = connectEditor(XrefEditor);
  registry['Example'] = connectEditor(ExampleEditor);
  registry['Figure'] = connectEditor(FigureEditor);
  registry['Pullout'] = connectEditor(PulloutEditor);
  registry['Section'] = connectEditor(SectionEditor);
  registry['WbInline'] = connectEditor(WbInlineEditor);
  registry['Activity'] = connectEditor(ActivityEditor);
  registry['YouTube'] = connectEditor(YouTubeEditor);
  registry['BlockCode'] = connectEditor(BlockCodeEditor);
  registry['BlockFormula'] = connectEditor(BlockFormulaEditor);
  registry['Audio'] = connectEditor(AudioEditor);
  registry['Video'] = connectEditor(VideoEditor);
  registry['IFrame'] = connectEditor(IFrameEditor);
  registry['Ol'] = connectEditor(OrderedListEditor);
  registry['Ul'] = connectEditor(UnorderedListEditor);
  registry['Li'] = connectEditor(ListItemEditor);
  registry['Table'] = connectEditor(TableEditor);
  registry['CellData'] = connectEditor(CellEditor);
  registry['CellHeader'] = connectEditor(CellEditor);
  registry['Definition'] = connectEditor(DefinitionEditor);
  registry['Meaning'] = connectEditor(MeaningEditor);
  registry['Translation'] = connectEditor(TranslationEditor);
  registry['Pronunciation'] = connectEditor(PronunciationEditor);
  registry['Materials'] = connectEditor(MaterialsEditor);
  registry['Material'] = connectEditor(MaterialEditor);
  registry['Composite'] = connectEditor(CompositeEditor);
  registry['Instructions'] = connectEditor(InstructionsEditor);
  registry['Alternatives'] = connectEditor(AlternativesEditor);
  registry['Alternative'] = connectEditor(AlternativeEditor);
}
