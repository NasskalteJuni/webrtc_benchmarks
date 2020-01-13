README:

Purpose:
This is a benchmark project to check how fast common webrtc functions are run.
Its main purpose is to give an overview, indicating which webrtc api functions need more time under which circumstances.
This may indicate, how much time is lost due to glare and roleback as well which glare handling and avoidance method is preferable for a quick connection setup

Setup:
The defined suites were run on different platforms but mainly on the same browser (Chrome Canary, due to the state of implementation of the webrtc standard at the time).
The results below may be due to the used plattforms and browsers, as mentioned in "Problems".

Problems:
Running benchmarks against webrtc functions is also always running benchmarks against the OS, since the browser relies on the OS opening ports, for example.
Errors can also appear due to the need to call the webrtc functions in a well defined order due to webrtc containing multiple state machines.
A call to the createAnswer function without setting a remote Description first is bound to throw an error, so testing it relies on including some preparation-work.

Results:
The number of added media and the resulting number of media lines in the offer and answer are the most important factor of the duration.
Rollbacks are quick and therefore no problem.