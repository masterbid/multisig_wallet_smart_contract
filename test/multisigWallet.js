const { expectRevert } = require('@openzeppelin/test-helpers')
const MultiSig = artifacts.require('MultiSig')

contract('MultiSig', (accounts) => {
    let multiSig = null
    before(async() => {
        multiSig = await MultiSig.deployed()
    })

    it('Should create transfer', async() => {
        await multiSig.createTransfer(100, accounts[5], {from: accounts[0]})
        const transfer = await multiSig.transfers(0)
        assert(transfer.id.toNumber() === 0)
        assert(transfer.amount.toNumber() === 100)
    })

    it('Should NOT create transfer', async() => {
        await expectRevert(
            multiSig.createTransfer(100, accounts[5], {from: accounts[6]}),
            'only approver allowed'
        )
    })

    it('Should NOT send transfer if quorum not reached', async () => {
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[6]))
        await multiSig.createTransfer(100, accounts[6], {from: accounts[0]})
        await multiSig.sendTransfer(1, { from: accounts[1]})
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[6]))
        assert(balanceAfter.sub(balanceBefore).isZero())
    })

    it('Should send transfer if quorum reached', async () => {
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[6]))
        await multiSig.createTransfer(100, accounts[6], {from: accounts[0]})
        await multiSig.sendTransfer(2, { from: accounts[1]})
        await multiSig.sendTransfer(2, { from: accounts[2]})
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[6]))
        assert(balanceAfter.sub(balanceBefore).toNumber() === 100)
    })
})