minesweeper-js
==============

## An implementation of minesweeper in Javascript, written in a few hours of coding

![Flags](http://i.imgur.com/IAUOJh4.png)
![Bombs](http://i.imgur.com/mQxWlAT.png?1)


Inspired by http://rkoutnik.com/articles/How-I-Interview.html, I decided to see how 
difficult it would be to implement minesweeper.
The article mentions that you could use any languages or tools but I think most people would
stick to the JSBin that they provided so I did all of the work in the JSBin.

## Challenges:

### Javascript

I spent most of my time debugging my Javascript code. Javascript is a very difficult language
to use in interviews, mostly because it's very hard to debug effectively, with lots of 
vague error messages and having to deal with both null and undefined (null being bad enough by itself
to be one of the most costly mistakes in language design). Also "proper" ES5 Javascript can be
surprisingly verbose since you have to add lots of checks and hacks that modern languages already have. I still 
like Javascript, but I haven't worked on a Javascript project in a while and coming from a Rust project the 
general lack of safety that Javascript provides caused me to spend a lot more time debugging instead of writing code.

### Mine layout

I messed up on this part mainly due to lack of understanding how Minesweeper lays out the mines.
I initially thought that the mines are evenly distributed throughout the board, so I broke up the mines evenly and 
applied them randomly to each row. Then if there are extra mines at the end, I would add them to random parts of the board.
Then I realized that the mines were supposed to be randomly distributed across the whole board and the whole even distribution thing was a waste of time 
so I had to remove it (facepalm).

### Recursive tile pressing

The last problem I had was with the recursive tile pressing part of Minesweeper. In Minesweeper
if a pressed tile has no adjacent bombs, then all adjacent tiles are also pressed. I initially naively just recursively
called the tile pressing function on the adjacent tiles, which blew up JSBin because the adjacent tiles would think the original
tile was an adjacent tile and call it again which went on forever. I then tried to store the state of previously pressed tiles as 
an "immutable" hashmap that is passed through the recursive function, which wasn't working until I realized I could just check if a tile was already pressed before recursively 
calling it (facepalm 2).

## Contributing

I am now using the [standard style](https://github.com/feross/standard). You can run

```
standard ./minesweeper.js
```

to check for linting errors.
