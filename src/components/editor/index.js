// @flow
import React from 'react';
// eslint-disable-next-line no-unused-vars
import ReactDOM from 'react-dom';
import {
  EditorState,
  RichUtils,
  convertToRaw,
  SelectionState,
  convertFromRaw,
} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import {
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  BlockquoteButton,
  CodeBlockButton,
  OrderedListButton,
  UnorderedListButton,
} from 'draft-js-buttons';
import createAutoListPlugin from 'draft-js-autolist-plugin';
import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';
import createImagePlugin from 'draft-js-image-plugin';

import 'draft-js-side-toolbar-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import './editor.scss';


type Field = {
    name: string,
    label: string,
    onUploadFinished?: (filepath: string) => void,
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
    modalIsActive: boolean,
    imageUri?: string,
};

const sideToolbarPlugin = createSideToolbarPlugin();
const autoListPlugin = createAutoListPlugin();
const imagePlugin = createImagePlugin();

const { addImage } = imagePlugin;

const plugins = [
  autoListPlugin,
  sideToolbarPlugin,
  imagePlugin,
];

const { SideToolbar } = sideToolbarPlugin;

export default class TextEditor extends React.Component<Props, State> {
    state: State;


    constructor(props: Props) {
      super(props);
      this.state = {
        editorState: props.input.value
          ? EditorState.createWithContent(convertFromRaw(props.input.value))
          : createEditorStateWithText(''),
        modalIsActive: false,
      };
    }


    onChange = (editorState: EditorState) => {
      this.setState({ editorState });
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
        focusOffset: length,
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
        return 'handled';
      }
      return 'not-handled';
    }

    render() {
      return (
        <div>
          <div className={`modal ${this.state.modalIsActive ? 'is-active' : ''}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Image Upload</p>
                <button className="delete" aria-label="close"></button>
              </header>
              <section className="modal-card-body">
                <div className="file has-name is-fullwidth">
                  <label className="file-label">
                    <input className="file-input" type="file" name="image" onChange={
                      // eslint-disable-next-line no-console
                      (e) => console.log(e.target.value)
                    }/>
                    <span className="file-cta">
                      <span className="file-icon">
                        <i className="fas fa-upload"></i>
                      </span>
                      <span className="file-label">
                        Choose a file…
                      </span>
                    </span>
                    <span className="file-name">
                    </span>
                  </label>
                </div>
                <span style={{
                  textAlign: 'center',
                  width: '100%',
                  margin: '10px auto',
                  display: 'block',
                }}>or</span>
                <div>
                  <input
                    className="input"
                    type="text"
                    onChange={(e) => this.setState({
                      imageUri: e.target.value,
                    })}/>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button
                  disabled={!this.state.imageUri}
                  className="button is-info" onClick={() => {
                    if (this.state.imageUri) {
                      const es = addImage(this.state.editorState, this.state.imageUri);
                      this.onChange(es);
                      this.setState({
                        imageUri: '',
                        modalIsActive: false,
                      });
                    }
                  }}>
                    Save changes
                </button>
                <button
                  className="button is-danger"
                  onClick={() => {
                    this.setState({
                      imageUri: '',
                      modalIsActive: false,
                    });
                  }}
                >Cancel</button>
              </footer>
            </div>
          </div>
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
            <SideToolbar>
              {(externalProps) => (
                <div>
                  <HeadlineOneButton {...externalProps} />
                  <HeadlineTwoButton {...externalProps} />
                  <HeadlineThreeButton {...externalProps} />
                  <BlockquoteButton {...externalProps} />
                  <CodeBlockButton {...externalProps} />
                  <OrderedListButton {...externalProps}/>
                  <UnorderedListButton {...externalProps}/>
                  <div onClick={() => this.setState({ modalIsActive: true })}>
                    <i className="far fa-images">
                    </i>
                  </div>
                </div>
              )}
            </SideToolbar>
          </div>
          <style jsx>{`
            .button-rapper{
              display: inline-block;
            }

            .fa-images{
              text-align: center;
              background: #fbfbfb;
              color: #888;
              font-size: 18px;
              border: 0;
              padding-top: 5px;
              vertical-align: bottom;
              height: 34px;
              width: 36px;
              cursor: pointer;
            }

         .fa-images:hover,
         .fa-images:focus {
            background: #f3f3f3;
            outline: 0; /* reset for :focus */
          }
 

          .separator {
            display: inline-block;
            border-right: 1px solid #ddd;
            height: 24px;
            margin: 0 0.5em;
          }
            `}</style>
        </div>
      );
    }
}
