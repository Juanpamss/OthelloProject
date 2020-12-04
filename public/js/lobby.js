getOpenGames()

async function getOpenGames(){
    const response = await fetch('/openGames')
    const data = await response.json()

    if(data.games != null){
        let dataToDisplay = {
            rows: []
        }

        for (let gameId in data.games) {
            if(data.games[gameId].player_white.username == data.user
                || data.games[gameId].player_black.username == data.user){
                let opponent = data.games[gameId].player_white.username == data.user ? data.games[gameId].player_black.username : data.games[gameId].player_white.username
                dataToDisplay.rows.push(
                    [
                        gameId,
                        opponent,
                        data.games[gameId]
                    ]
                )
            }
        }

        /*console.log(dataToDisplay)
        console.log(data.user)*/

        const table = document.querySelector('.table_lobby')

        for(const row of dataToDisplay.rows){
            table.querySelector("tbody").insertAdjacentHTML("beforeend",`
                <tr>${row.map(
                function (itemData, index) {
                    /// if index === 0 ( it is first element in array ) then add class active 
                    if(index === 2){
                        const gameId = row[0];
                        return `<td><button class="btn btn-dark" onclick="game_rejoin('${gameId}','${itemData}')">Rejoin</button></td>`
                    }else{
                        return `<td>${itemData}</td>`
                    }
                }
            ).join("")}
                </tr>
            `)
        }
    }
}