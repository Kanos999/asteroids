//the class file of a player

class Player {
    constructor(name, pos, score) {
        this.username = name;
        this.pos = pos;
        this.score = score;
    }

    move(facing) {
        console.log("moving in direction of: " + facing);
    }
}
