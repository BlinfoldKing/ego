// @flow
import React from "react";
// eslint-disable-next-line no-unused-vars
import ReactDOM from "react-dom";
import {
  EditorState,
  RichUtils,
  convertToRaw,
  SelectionState,
  convertFromRaw
} from "draft-js";
import Editor, {createEditorStateWithText} from 'draft-js-plugins-editor'

import createAutoListPlugin from 'draft-js-autolist-plugin'
import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';

import 'draft-js-side-toolbar-plugin/lib/plugin.css';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import './editor.scss';



type Field = {
    name: string,
    label: string,
    onUploadFinished?: (filepath: string) => void
};

type Props = {
    input: {
        name: string,
        value?: any,
        onChange: any => void
    },
    meta: any,
    field: Field
};

type State = {
    editorState: EditorState,
    currentStyle: {
      bold: boolean,
      italic: boolean,
      block: boolean,
      code: boolean,
    }
};

type Action = {
    icon: Node,
    tooltip?: string | "",
    onClick?: void => void,
    title?: string | "unknown"
};


const sideToolbarPlugin = createSideToolbarPlugin();
const autoListPlugin = createAutoListPlugin()

const plugins = [
  autoListPlugin,
  sideToolbarPlugin
]

const { SideToolbar } = sideToolbarPlugin;

export default class TextEditor extends React.Component<Props, State> {
    state: State;

    actions: Array<Action>;
    plugins: Array<any>;

    componentDidMount() {
      
    }
    
    constructor(props: Props) {
      super(props);
      this.state = {
        currentStyle: {
          bold: false,
          italic: false,
          block: false,
          code: false,
        }, 
        editorState: props.input.value ?  
          EditorState.createWithContent(convertFromRaw(props.input.value))
          : createEditorStateWithText('')
      };
    }

    

    onChange = (editorState: EditorState) => {
      // eslint-disable-next-line no-console
      // if (editorState.getCurrentContent().hasText()) {
      this.setState({ editorState });
      // } else {
      //   this.setState({
      //     editorState: EditorState.createEmpty()
      //   });
      // }

      const raw = convertToRaw(editorState.getCurrentContent());
      this.props.input.onChange(raw);
    };

    moveSelectionToEnd = (editorState: EditorState) => {
      const content = editorState.getCurrentContent();
      const blockMap = content.getBlockMap();

      const key = blockMap.last().getKey();
      const length = blockMap.last().getLength();

      // On Chrome and Safari, calling focus on contenteditable focuses the
      // cursor at the first character. This is something you don't expect when
      // you're clicking on an input element but not directly on a character.
      // Put the cursor back where it was before the blur.
      const selection = new SelectionState({
        anchorKey: key,
        anchorOffset: length,
        focusKey: key,
        focusOffset: length
      });
      return EditorState.forceSelection(editorState, selection);
    };

    onFocus = () => {
      const es = this.moveSelectionToEnd(this.state.editorState);
      this.setState({ editorState: es });
    };

    handleKeyCommand(command: any, editorState: any) {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this.onChange(newState);
        return "handled";
      }
      return "not-handled";
    }

    render() {
      return (
        <div>
          <label htmlFor={this.props.field.name}>
            {this.props.field.label}
          </label>
          <div
            className="editor" 
          >
            <Editor
              plugins={plugins}
              handleKeyCommand={this.handleKeyCommand.bind(this)}
              editorState={this.state.editorState}
              onChange={this.onChange}
              onFocus={() => this.onFocus()}
              placeholder="Enter Your Text Below"
            />
            <SideToolbar/>
          </div>
        </div>
      );
    }
}
