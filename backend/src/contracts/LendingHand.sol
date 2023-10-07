// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.7.0;

contract LendingHand {
   uint public postCount = 0;
   mapping(uint => Post) public posts;
   string public name;


   struct Post {
      uint id;
      string name;
      string description;
      uint goal;
      uint current;
      address payable owner;
      bool reachedGoal;
      address[1000] donors;
      uint[1000] donations;
      uint numDonors;
      string image;
   }


    event PostCreated(
      uint id,
      string name,
      string description,
      uint goal,
      uint current,
      address payable owner,
      bool reachedGoal,
      address[1000] donors,
      uint[1000] donations,
      uint numDonors,
      string image
    );

    event PostDonated(
      uint id,
      string name,
      string description,
      uint goal,
      uint current,
      address payable owner,
      bool reachedGoal,
      address[1000] donors,
      uint[1000] donations,
      uint numDonors,
      string image
    );

    event PostDeleted(
      string name
    );

    event PostEdited(
      string name,
      string description,
      uint goal,
      string image
    );

    constructor() public {
    name = "Lending Hand";
  }


   function createPost(string memory _name, string memory _description, uint _goal, string memory _image) public {
        //Make sure parameters are correct
        //Create the product
        require(bytes(_name).length > 0);
        require(bytes(_description).length > 0);
        require(_goal > 0);



        address[1000] memory _donors;
        uint[1000] memory _donations;
        //Increment Product Count
        postCount += 1;
        posts[postCount] = Post(postCount, _name, _description, _goal, 0, msg.sender, false, _donors, _donations, 0, _image); //msg.sender is person who called the function
        //Trigger an event (debugging purposes)
        emit PostCreated(postCount, _name, _description, _goal, 0, msg.sender, false, _donors, _donations, 0, _image);
   }

   function editPost(uint _id, string memory _name, string memory _description, uint _goal, string memory _image) public {
      require(_id > 0 && _id <= postCount);
      require(bytes(_name).length > 0);
      require(bytes(_description).length > 0);
      require(_goal > 0);

      
      Post memory _post = posts[_id];

      require(_post.owner == msg.sender);

      _post.name = _name;
      _post.description = _description;
      _post.goal = _goal;
      _post.image = _image;

     posts[_id] = _post;

      emit PostEdited(posts[_id].name, posts[_id].description, posts[_id].goal, posts[_id].image);



   }

   function deletePost(uint _id) public {
      require(_id > 0 && _id <= postCount);
      Post memory _post = posts[_id];

      require(_post.owner == msg.sender);

      _post.name = "";

      posts[_id] = _post;

      emit PostDeleted(posts[_id].name);
   }



   function donateToPost(uint _id) public payable {
    //Fetch the product
    Post memory _post = posts[_id];
    //Fetch the owner
    address payable _donee = _post.owner;
    //Make sure the product is valid
    require(_id > 0 && _id <= postCount);
    //Require that there is enough Ether in the transaction
    require(msg.value >= 0);

    require(!_post.reachedGoal);

    require(_donee != msg.sender);

    require(_post.numDonors < 1000);



    //update the post statistics
    _post.donors[_post.numDonors] = msg.sender;
    _post.donations[_post.numDonors] = msg.value;

    _post.numDonors += 1;

    _post.current += msg.value;

    if (_post.current >= _post.goal) {
        _post.reachedGoal = true;
    }

    // Update the product
    posts[_id] = _post;
    //Pay the seller sending them Ether


    _donee.transfer(msg.value);
    //Trigger an event
    emit PostDonated(_id, _post.name, _post.description, _post.goal, _post.current, _donee, _post.reachedGoal, _post.donors, _post.donations, _post.numDonors, _post.image);
   }

}