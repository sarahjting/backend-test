# Casino Game Code Challenge

You have been provided with a simple dice game app exposed through a graphql api.
The app uses cryptographic hashes to generate randomized outcomes to ensure the results are not rigged to favour the casino.
This is very similar to what our clients websites stake.com and primedice.com use to gurantee provably fair results for the player.

The backend is broken up into a top layer graphql API that talks to a dice and a statistic microservice.
The statistic service is listening to bets created by the dice service to collect statistics for the user.
Wagered is how much a user has bet overall, profit is how much money he/she won or lost.

To keep things simple we skipped most error handling, input validation and user register / login.

# Get Started

Run the `start.sh` script to get the backend running, the script will install top level / service level `node_modules` and start the App in docker-compose.
Navigate to `http://localhost/graphql` in your browser to open the graphQL schema.

# The Challenge

## Fix the Dice tests:

> The dice game uses an incrementing nonce to generate the result of each game.
> It is important that no nonces are duplicated or skipped, otherwise the casino could just skip a bet where the player wins.
> One of the tests in the dice game is checking exactly that and is failing at the minute if the player managed to place bets really quickly one after another.
> In the test this is just done with calling the `diceBet` function in a loop, but think of a player using hotkeys on a fast internet connection.
>
> - Find a solid way to prevent skipped / duplicated nonces to make the test pass.

My solution is to increment and get the updated nonce in a single SQL query.

## Add a New Game:

> We want to add a new game where the player spins a wheel divided into ten segments. Each segment has a number that the player's wager will be multiplied by.
> This game actually exists on stake.com, so lets use the same payouts :)
> There is one field with a `1.50x` payout, seven fields with a `1.20x` payout and two fields with a `0.00x` payout.
>
> - Add a wheel service to the codebase (it has to bbe provably fair)
> - Add the wheel game to the graphql schema

Some notes:

I wasn't sure what sort of solution you wanted for this or what the scope for this test was - to my understanding, basically all of the backend structure for the wheel spinning game could be identical to the dice game barring the result & payout calculation... For the purposes of the test, I just copy pasted the dice folder and replaced some values, but this is obviously non-ideal and not something I'd do in practice (big DRY violation)!!

Realistically I would suggest extracting seed/nonce management into another service, as it seems like it can be reused for multiple games.

Other than that, I hardcoded in the wheel segments (I made the assumption this would be ok because there're hardcoded values in `dice.js`); this can be extracted for configurability.

## Add support for multiple games to the statistics service.

> The statistic service is listening to a redis pub/sub to update the statistics for the user.
> After you added the wheel game, the players want to know how much they wagered / profited per game, rather then just their overall statistics.
>
> - Make the statistic service collect wagered / profit per game per user, rather then just per user
> - Update the statistics in the graphql schema

Opted to make a separate table (`game_statistic`) that gives a user a separate row for each game.

For the graphQL schema, I added a `game` argument to the `User{statistic}` resolver.

## Prevent multiple seed lookups

> When you look up the seed for a bet in the bet list of a user we currently do one request per bet to ask the dice service for the seed.
> This is unneccessary since the seed lookup returns the exact same result each time and created load on the server.
>
> - Find a way to reduce the seed lookups

Yay DataLoader
