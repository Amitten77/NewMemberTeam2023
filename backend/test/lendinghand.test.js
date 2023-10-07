const LendingHand = artifacts.require("./LendingHand.sol")

require('chai').use(require('chai-as-promised')).should()


contract('Marketplace', ([deployer, donee, donor]) => {
    let marketplace

    before(async () => {
        marketplace = await LendingHand.deployed()
    })


    describe('deployment', async() => {
        it('deploys successfully', async () => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await marketplace.name()
            assert.equal(name, 'Lending Hand')
            assert.notEqual(name, 'Vikram')
        })
    })

    describe('postCreation', async() => {
        let result, postCount

        before(async () => {
            result = await marketplace.createPost('Vikram', 'My name is Vikram', web3.utils.toWei('1', 'Ether'), "Image", {from: donee}) //In Wei (Bian)
            postCount = await marketplace.postCount()
            })
        it('creates posts', async () => {
            assert.notEqual(postCount, 0)
            assert.equal(postCount, 1)

            const event = result.logs[0].args

            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'Vikram' , 'name is correct')
            assert.equal(event.description, 'My name is Vikram' , 'description is correct')
            assert.equal(event.goal, '1000000000000000000' , 'price is correct')
            assert.equal(event.current, '0' , 'current amount raised is correct')
            assert.equal(event.owner, donee, 'owner is correct')
            assert.equal(event.reachedGoal, false, 'purchased is correct')
            assert.equal(event.numDonors, '0' , 'numDonors is correct')
            assert.equal(event.image, 'Image', 'Post Image is correct')


        })

        it('lists posts', async () => {
            const post = await marketplace.posts(postCount)

            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(post.name, 'Vikram' , 'name is correct')
            assert.equal(post.description, 'My name is Vikram' , 'description is correct')
            assert.equal(post.goal, '1000000000000000000' , 'price is correct')
            assert.equal(post.current, '0' , 'current amount raised is correct')
            assert.equal(post.owner, donee, 'owner is correct')
            assert.equal(post.reachedGoal, false, 'purchased is correct')
            assert.equal(post.numDonors, '0' , 'numDonors is correct')
            assert.equal(post.image, "Image", "image is correct")
        }) 

        it('can donate', async () => {
            let oldDoneeBalance
            oldDoneeBalance = await web3.eth.getBalance(donee)
            oldDoneeBalance = new web3.utils.BN(oldDoneeBalance)

            result = await marketplace.donateToPost(postCount, {from: donor, value: web3.utils.toWei('1', 'Ether')})

            //Check logs
            const event = result.logs[0].args

            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'Vikram' , 'name is correct')
            assert.equal(event.description, 'My name is Vikram' , 'description is correct')
            assert.equal(event.goal, '1000000000000000000' , 'price is correct')
            assert.equal(event.current, '1000000000000000000' , 'current amount raised is correct')
            assert.equal(event.owner, donee, 'owner is correct')
            assert.equal(event.reachedGoal, true, 'purchased is correct')
            assert.equal(event.numDonors, '1' , 'numDonors is correct')
            assert.equal(event.donors[0], donor, 'Donor is correct')
            assert.equal(event.donations[0], '1000000000000000000', 'Donations is correct')


            let newDoneeBalance
            newDoneeBalance = await web3.eth.getBalance(donee)
            newDoneeBalance = new web3.utils.BN(newDoneeBalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)

            const expectedBalance = oldDoneeBalance.add(price)
            assert.equal(newDoneeBalance.toString(), expectedBalance.toString())

            await marketplace.donateToPost(99, {from: donor, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected

            await marketplace.donateToPost(postCount, {from: donee, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected
        })
    })

    describe('Edit and Delete Post', async() => {
        let result, postCount, post, editResult

        before(async () => {
            result = await marketplace.createPost('Vikram', 'My name is Vikram', web3.utils.toWei('1', 'Ether'), "Image", {from: donee}) //In Wei (Bian)
            postCount = await marketplace.postCount()
        })



        it('edits successfully', async () => {
            editResult = await marketplace.editPost(1, "Abbu", "My name is Abbu", web3.utils.toWei('1', 'Ether'), "AbbuImage", {from: donee})
            post = editResult.logs[0].args
            assert.equal(post.name, 'Abbu' , 'name is correct')
            assert.equal(post.description, 'My name is Abbu' , 'description is correct')
            assert.equal(post.goal, '1000000000000000000' , 'price is correct')
            assert.equal(post.image, "AbbuImage", "Image is correct")

        })

        it('Edits should fail', async () => {
            await marketplace.editPost(1, "Abbu", "My name is Abbu", web3.utils.toWei('1', 'Ether'), "AbbuImage", {from: donor}).should.be.rejected
            await marketplace.editPost(200, "Abbu", "My name is Abbu", web3.utils.toWei('1', 'Ether'), "AbbuImage", {from: donee}).should.be.rejected
            await marketplace.editPost(1, "", "My name is Abbu", web3.utils.toWei('1', 'Ether'), "AbbuImage", {from: donee}).should.be.rejected
            await marketplace.editPost(1, "Abbu", "", web3.utils.toWei('1', 'Ether'), "AbbuImage", {from: donee}).should.be.rejected
        })
        

        it('deletes successfully', async () => {
            deleteResult = await marketplace.deletePost(1, {from: donee});
            post = await marketplace.posts(1)
            assert.equal(post.name, "", "Post Name should be empty, which means the post is deleted")
        })

        it('Deletes should fail', async () => {
            await marketplace.deletePost(2, {from: donor}).should.be.rejected;
            await marketplace.deletePost(200, {from: donee}).should.be.rejected;
        })
    })


})