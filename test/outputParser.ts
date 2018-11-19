import "mocha";

import { parseOutputs } from "../src";
import { deepStrictEqual } from "assert";
import BigNumber from "bignumber.js";

describe('outputParser', () => {

	it('successful', () => {
		deepStrictEqual(
			parseOutputs(
				Buffer.from([
					'88b9c2bbc10b432a6fdfee678996f3ebf9a0ef9b5bcc91acf2a96963790646eb', // bytes32
					'00000000000000000000000000000000000000000000000000000000000001a0', // string (offset)
					'0000000000000000000000000100000000000000000000000000000000000141', // address (1.16.321)
					'0000000000000000000000000000000000000000000000000000000000000120', // bytes32[] (offset)
					'736f776a990aed7b1b5f97c335c569163757d885704bb1cc6ad55880413e920f', // uint256 (in hex)
					'd00e5f660d51cf496e2252d0a5428a30b7b37981aa033835e4fceecd7293cef5', // int256
					'0000000000000000000000000000000000000000000000000000000000000039', // uint8 (in hex)
					'0000000000000000000000000000000000000000000000000000000000000001', // bool (1 -- true)
					'0000000000000000000000000000000000000000000000000000000000000200', // uint256[] (offset)
					'0000000000000000000000000000000000000000000000000000000000000003', // bytes32[] (length)
					'258399d253bfa96802fcbebc08336757e2d8119be009f40215d579923ffa5f67', // bytes32[] (0)
					'9c203a46b9d600183bb1f2badba93facc8033ab30a1cce8e07d58bccf6101c3f', // bytes32[] (1)
					'6b705817cd4d3333a38a3a8d3ef052f04a4ceebf5d19508d042716adcd7aa8a3', // bytes32[] (2)
					'0000000000000000000000000000000000000000000000000000000000000030', // string (length)
					'3d6721384d4926456e47463a4b245b2643742f533d6946746c2e76297544612d', // string (0-31)
					'295d3c613c5353422b2a2835395b525800000000000000000000000000000000', // string (32-63)
					'0000000000000000000000000000000000000000000000000000000000000002', // uint256[] (length)
					'55780e981d3758041b5d8d93197d99a1ef3977a75367e8e53f139a81a321505c', // uint256[] (0)
					'0d0c559b7b7e90b72024b7c21efba11e0406a1099c53619a067e067773a07584', // uint256[] (0)
				].join(''), 'hex'),
				[
					{ type: 'bytes32', name: 'bytes32' },
					{ type: 'string', name: 'string' },
					{ type: 'address', name: 'address' },
					{ type: 'bytes32[]', name: 'bytes32[]' }, 
					{ type: 'uint256', name: 'uint256' },
					{ type: 'int256', name: 'int256' },
					{ type: 'uint8', name: 'uint8' },
					{ type: 'bool', name: 'bool' },
					{ type: 'uint256[]', name: 'uint256[]' },
				],
			),
			[
				Buffer.from('88b9c2bbc10b432a6fdfee678996f3ebf9a0ef9b5bcc91acf2a96963790646eb', 'hex'),
				'=g!8MI&EnGF:K$[&Ct/S=iFtl.v)uDa-)]<a<SSB+*(59[RX',
				'1.16.321',
				[
					Buffer.from('258399d253bfa96802fcbebc08336757e2d8119be009f40215d579923ffa5f67', 'hex'),
					Buffer.from('9c203a46b9d600183bb1f2badba93facc8033ab30a1cce8e07d58bccf6101c3f', 'hex'),
					Buffer.from('6b705817cd4d3333a38a3a8d3ef052f04a4ceebf5d19508d042716adcd7aa8a3', 'hex'),
				],
				new BigNumber('52212921792952926122328296875284124363527779483568880653876521571163289063951'),
				new BigNumber('-21685622455869669752299262332908338053727183781328838271205707804276662481163'),
				57,
				true,
				[
					new BigNumber('38658714502788621188451447595568361104157517286179440635030547021244156432476'),
					new BigNumber('5901860036596492084443611188678224548110052085744359470091093935014753105284'),
				]
			],
		);
	});

});