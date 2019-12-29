// @flow
import React from 'react';
// eslint-disable-next-line no-unused-vars
import ReactDOM from 'react-dom';

import { BarLoader } from 'react-spinners';

import {
  EditorState,
  RichUtils,
  convertToRaw,
  SelectionState,
  convertFromRaw,
} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import {
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
// import createMarkdownPlugin from 'draft-js-markdown-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';

import axios from 'axios';

import 'draft-js-side-toolbar-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';

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
    uploading: boolean
};

// const languages = {
//   auto: 'automatic',
// };

// const markdownPlugin = createMarkdownPlugin({ languages });
const sideToolbarPlugin = createSideToolbarPlugin();
const autoListPlugin = createAutoListPlugin();
const imagePlugin = createImagePlugin();
const inlineToolbarPlugin = createInlineToolbarPlugin();

const { addImage } = imagePlugin;

const plugins = [
  autoListPlugin,
  sideToolbarPlugin,
  imagePlugin,
  // markdownPlugin,
  inlineToolbarPlugin,
];

const { InlineToolbar } = inlineToolbarPlugin;
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
        uploading: false,
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
                      (e) => {
                        const files = Array.from(e.target.files);
                        // this.setState({ uploading: true });

                        const formData = new FormData();

                        files.forEach((file, i) => {
                          formData.append(`${i}`, file);
                        });

                        this.setState({ uploading: true });
                        axios.request({
                          method: 'post',
                          // $FlowFixMe
                          url: `${window.location.origin}/image-upload`,
                          headers: { 'Content-Type': 'multipart/form-data' },
                          data: formData,
                        }).then((res) => {
                          const image = res.data[0];
                          this.setState({ imageUri: image.url, uploading: false });
                        });
                      }
                    }/>
                    <span className="file-cta">
                      <span className="file-icon">
                        <i className="fas fa-upload"></i>
                      </span>
                      <span className="file-label">
                        Choose an image…
                      </span>
                    </span>
                    <span className="file-name">
                      {this.state.imageUri}
                    </span>
                  </label>
                </div>
                <div style={{ width: '100%' }}>
                  {
                    this.state.uploading
                    && <BarLoader
                      size={'100%'}
                      css={{ width: '100%' }}
                      color={'hsl(204, 86%, 53%)'}
                      loading={this.state.uploading}
                    />
                  }
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
                    })}
                  />
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
              editorState={this.state.editorState}
              onChange={this.onChange}
              onFocus={() => this.onFocus()}
              placeholder="Enter Your Text Below"
            />
            <InlineToolbar />
            <SideToolbar>
              {(externalProps) => (
                <div>
                  {/* <HeadlineOneButton {...externalProps} /> */}
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
