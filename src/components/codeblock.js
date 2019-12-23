// @flow
import React, { PureComponent } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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
];

class CodeBlock extends PureComponent<Props> {
  render() {
    const { value } = this.props;
    let language;
    if (value.split('\n').length > 0) {
      const firstLine = value.split('\n')[0].split(' ');
      language = languages.includes(firstLine[firstLine.length - 1])
        ? firstLine[firstLine.length - 1]
        : '';
    }
    return (
      <div>
        <SyntaxHighlighter language={language} style={{ ...duotoneDark, fontSize: 20 }}>
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
