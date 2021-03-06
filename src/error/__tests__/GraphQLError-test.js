/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';

import { parse, Source, GraphQLError } from '../../';


describe('GraphQLError', () => {

  it('is a class and is a subclass of Error', () => {
    expect(new GraphQLError()).to.be.instanceof(Error);
    expect(new GraphQLError()).to.be.instanceof(GraphQLError);
  });

  it('has a name, message, and stack trace', () => {
    const e = new GraphQLError('msg');
    expect(e.name).to.equal('GraphQLError');
    expect(e.stack).to.be.a('string');
    expect(e.message).to.equal('msg');
  });

  it('uses the stack of an original error', () => {
    const original = new Error('original');
    const e = new GraphQLError(
      'msg',
      undefined,
      undefined,
      undefined,
      undefined,
      original
    );
    expect(e.name).to.equal('GraphQLError');
    expect(e.stack).to.equal(original.stack);
    expect(e.message).to.equal('msg');
    expect(e.originalError).to.equal(original);
  });

  it('creates new stack if original error has no stack', () => {
    const original = { message: 'original' };
    const e = new GraphQLError(
      'msg',
      null,
      null,
      null,
      null,
      original
    );
    expect(e.name).to.equal('GraphQLError');
    expect(e.stack).to.be.a('string');
    expect(e.message).to.equal('msg');
    expect(e.originalError).to.equal(original);
  });

  it('converts nodes to positions and locations', () => {
    const source = new Source(`{
      field
    }`);
    const ast = parse(source);
    const fieldNode = ast.definitions[0].selectionSet.selections[0];
    const e = new GraphQLError('msg', [ fieldNode ]);
    expect(e.nodes).to.deep.equal([ fieldNode ]);
    expect(e.source).to.equal(source);
    expect(e.positions).to.deep.equal([ 8 ]);
    expect(e.locations).to.deep.equal([ { line: 2, column: 7 } ]);
  });

  it('converts node with loc.start === 0 to positions and locations', () => {
    const source = new Source(`{
      field
    }`);
    const ast = parse(source);
    const operationNode = ast.definitions[0];
    const e = new GraphQLError('msg', [ operationNode ]);
    expect(e.nodes).to.deep.equal([ operationNode ]);
    expect(e.source).to.equal(source);
    expect(e.positions).to.deep.equal([ 0 ]);
    expect(e.locations).to.deep.equal([ { line: 1, column: 1 } ]);
  });

  it('converts source and positions to locations', () => {
    const source = new Source(`{
      field
    }`);
    const e = new GraphQLError('msg', null, source, [ 10 ]);
    expect(e.nodes).to.equal(undefined);
    expect(e.source).to.equal(source);
    expect(e.positions).to.deep.equal([ 10 ]);
    expect(e.locations).to.deep.equal([ { line: 2, column: 9 } ]);
  });

  it('serializes to include message', () => {
    const e = new GraphQLError('msg');
    expect(JSON.stringify(e)).to.equal('{"message":"msg"}');
  });

  it('serializes to include message and locations', () => {
    const node = parse('{ field }').definitions[0].selectionSet.selections[0];
    const e = new GraphQLError('msg', [ node ]);
    expect(JSON.stringify(e)).to.equal(
      '{"message":"msg","locations":[{"line":1,"column":3}]}'
    );
  });

  it('serializes to include path', () => {
    const e = new GraphQLError(
      'msg',
      null,
      null,
      null,
      [ 'path', 3, 'to', 'field' ]
    );
    expect(e.path).to.deep.equal([ 'path', 3, 'to', 'field' ]);
    expect(JSON.stringify(e)).to.equal(
      '{"message":"msg","path":["path",3,"to","field"]}'
    );
  });

});
