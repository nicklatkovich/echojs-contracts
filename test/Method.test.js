import 'mocha';
import { strictEqual, ok, fail } from 'assert';
import $c from 'comprehension';
import echo from 'echojs-lib';

import Contract from '../src/Contract';
import checkContractIdTests from './_checkContractId.test';

describe('Method', () => {
	describe('call', () => {

		before(() => echo.connect('wss://echo-dev.io/ws'));

		const contractId = '1.16.7829';
		const abi = [{
			constant: true,
			inputs: [{ name: '_addr', type: 'address' }],
			name: 'at',
			outputs: [{ name: 'o_code', type: 'bytes' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		}];
		// TODO: rewrite this when deployer will be done
		const contract = new Contract(abi, { echo, contractId });

		const expectedBytecode = [
			'730100000000000000000000000000000000001e953014608060405260043610',
			'610058576000357c010000000000000000000000000000000000000000000000',
			'0000000000900463ffffffff168063',

			'dce4a447',
			'1461005d575b600080fd5b610091600480360381019080803573ffffffffffff',
			'ffffffffffffffffffffffffffff16906020019092919050505061010c565b60',
			'4051808060200182810382528381815181526020019150805190602001908083',
			'8360005b838110156100d15780820151818401526020810190506100b6565b50',
			'505050905090810190601f1680156100fe578082038051600183602003610100',
			'0a031916815260200191505b509250505060405180910390f35b6060813b6040',
			'519150601f19601f602083010116820160405280825280600060208401853c50',
			'9190505600a165627a7a723058203d9ff6b5e532d4f524293e2aa213d2eb9cc5',
			'dc87c270a6d46cb42b0bb5566fbd0029',
		].join('');

		it('successful', async () => {
			/** @type {Buffer} */
			const bytecode = await contract.methods.at(contractId).call();
			ok(Buffer.isBuffer(bytecode));
			strictEqual(bytecode.toString('hex'), expectedBytecode);
		});

		describe('invalid contractId', () => {
			for (const { test, error, value } of checkContractIdTests) {
				it(test, async () => {
					try {
						await contract.methods.at(contractId).call({ contractId: value || test });
					} catch (err) {
						ok(err instanceof Error);
						strictEqual(err.message, error)
						return;
					}
					fail('should throws');
				});
			}
		});
	});

	describe('code getter', () => {
		it('get code method', () => {
			/** @type {Abi} */
			const abi = [{
				contract: false,
				inputs: [
					{ type: 'bytes24[3]', name: 'bytes72' },
					{ type: 'uint32[][2][]', name: 'multidimensional_array' },
					{ type: 'string', name: 'str' },
				],
				name: 'qwe',
				outputs: [{ type: 'bool', name: 'success' }],
				payable: false,
				stateMutability: 'nonpayable',
				type: 'function',
			}];
			const contract = new Contract(abi);
			const methodInstance = contract.methods.qwe(
				[
					Buffer.from($c(24, (i) => i)),
					{ value: 'dead', align: 'left' },
					{ value: 'qwe', encoding: 'ascii', align: 'right' },
				],
				[[[], [1]], [[2, 3], [4, 5, 6]], [[7, 8], [9]]],
				' \\(ꙨပꙨ)// ',
			);
			strictEqual(methodInstance.code, [
				'9c89d58f',
				'0000000000000000000102030405060708090a0b0c0d0e0f1011121314151617',
				'0000000000000000dead00000000000000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000717765',
				'00000000000000000000000000000000000000000000000000000000000000a0',
				'0000000000000000000000000000000000000000000000000000000000000180',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'00000000000000000000000000000000000000000000000000000000000002c0',
				'00000000000000000000000000000000000000000000000000000000000001c0',
				'00000000000000000000000000000000000000000000000000000000000002e0',
				'0000000000000000000000000000000000000000000000000000000000000200',
				'0000000000000000000000000000000000000000000000000000000000000340',
				'0000000000000000000000000000000000000000000000000000000000000280',
				'0000000000000000000000000000000000000000000000000000000000000010',
				'205c28ea99a8e18095ea99a8292f2f2000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'0000000000000000000000000000000000000000000000000000000000000004',
				'0000000000000000000000000000000000000000000000000000000000000005',
				'0000000000000000000000000000000000000000000000000000000000000006',
				'0000000000000000000000000000000000000000000000000000000000000001',
				'0000000000000000000000000000000000000000000000000000000000000009',
				'0000000000000000000000000000000000000000000000000000000000000000',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000003',
				'0000000000000000000000000000000000000000000000000000000000000002',
				'0000000000000000000000000000000000000000000000000000000000000007',
				'0000000000000000000000000000000000000000000000000000000000000008',
			].join(''));
		});
	});
});
