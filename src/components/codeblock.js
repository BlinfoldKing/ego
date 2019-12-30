// @flow
import React, { PureComponent } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneSpace as theme } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type Props = {
  language?: string,
  value: string
}

const languages = [
  'js',
  'javascript',
  'cpp',
  'c++',
  'jsx',
  'elixir',
  'haskell',
  'lisp',
  'go',
  'ruby',
  'rust',
];

const extension = {
  js: 'javascript',
  rs: 'rust',
  ex: 'elixir',
  rb: 'ruby',
  jsx: 'jsx',
  go: 'go',
  cpp: 'c++',
  hs: 'haskell',
  lisp: 'lisp',
};

class CodeBlock extends PureComponent<Props> {
  render() {
    const { value } = this.props;
    let language;
    if (value.split('\n').length > 0) {
      const firstLine = value.split('\n')[0].trim().split(' ');
      const arg = firstLine[firstLine.length - 1];
      language = languages.includes(arg)
        ? arg
        : '';

      if (language === '') {
        const filename = arg.split('.');
        const ext = filename[filename.length - 1];
        language = Object.keys(extension).includes(ext) ? extension[ext] : '';
      }
    }
    return (
      <div>
        <SyntaxHighlighter language={language} style={{ ...theme, fontSize: 20 }}>
          {value}
        </SyntaxHighlighter>
        <style jsx> {`
          code,
          pre {
            font-size: 20px !important
          }
        `}</style>
      </div>
    );
  }
}

export default CodeBlock;
