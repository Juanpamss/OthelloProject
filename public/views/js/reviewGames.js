{
    async function  getGameMoves(gameId){

        let root

        /*Game moves tables*/
        for(root of document.querySelectorAll(".table-refresh-moves")){
            const table = document.createElement('table')
            //const options = document.createElement('div')

            if(!table.classList.contains('table__refresh__table_moves')){
                table.classList.add('table__refresh__table_moves')

                table.innerHTML = `
                                    <thead>
                                        <tr></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Loading</td>
                                        </tr>
                                    </tbody>
                                `;
                root.append(table)
            }
        }

        const response = await fetch('/gameMoves/' + gameId)
        const data = await response.json()
        await showGameDetails(root, data)
    }

    async function showGameDetails(root, data){

        let dataToDisplay = {
            rows: []
        }

        data.forEach(function(message, index){
            dataToDisplay.rows.push(
                [
                    index+1,
                    message['COLUMN'],
                    message['ROW'],
                    message['COLOR'],
                    message['USERNAME']
                ]
            )
        });

        console.log(dataToDisplay.rows)

        const table = root.querySelector('.table__refresh__table_moves')

        /*Clear table*/
        table.querySelector("thead tr").innerHTML = ""
        table.querySelector("tbody tr").innerHTML = ""

        clearTable()

        const headers = {
            headers: ["MOVE #", "COLUMN", "ROW", "COLOR", "PLAYER"]
        }

        /*Populate headers*/
        for(const header of headers.headers){
            table.querySelector("thead tr").insertAdjacentHTML("beforeend",`<th>${header}</th>`)
        }

        /*Populate rows*/
        for(const row of dataToDisplay.rows){
            table.querySelector("tbody").insertAdjacentHTML("beforeend",`
                <tr>${row.map(col => `<td>${col}</td>`).join("")}</tr>`)
        }

        let x = document.getElementById("game_moves");
        x.style.display = 'block'

        let y = document.getElementById('gameMovesButton')
        y.style.display = 'block'

        let z = document.getElementById('gameMovesLabel')
        z.style.display = 'block'

        //Clear the data to display
        while (dataToDisplay.rows.length > 0) {
            dataToDisplay.rows.pop();
        }
    }

    /*Main Table*/
    for(const root of document.querySelectorAll(".table-refresh")){
        const table = document.createElement('table')
        table.classList.add('table-refresh__table')
        table.innerHTML = `
            <thead>
                <tr></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Loading</td>
                </tr>
            </tbody>
        `;

        root.append(table)

        updateTable(root)
    }

    async function updateTable(root){

        let parsedJSON = JSON.parse(dataReceived)
        let dataToDisplay = {
            rows: []
        }
        parsedJSON.forEach(function(message){
            dataToDisplay.rows.push(
                [
                    message['GAME_ID'],
                    message['WHITE_PLAYER'],
                    message['BLACK_PLAYER'],
                    message['WINNER']
                ]
            )
        });

        //root.querySelector('.table-refresh__button').classList.add("table-refresh__button-refreshing")
        const table = root.querySelector('.table-refresh__table')

        /*Clear table*/
        table.querySelector("thead tr").innerHTML = ""
        table.querySelector("tbody tr").innerHTML = ""

        const headers = {
            headers: ["Game", "White Player", "Black Player", "Winner"]
        }

        /*Populate headers*/
        for(const header of headers.headers){
            table.querySelector("thead tr").insertAdjacentHTML("beforeend",`<th>${header}</th>`)
        }

        /*Populate rows*/
        for(const row of dataToDisplay.rows){
            table.querySelector("tbody").insertAdjacentHTML("beforeend",`
                <tr>${row.map(
                function (itemData, index) {
                    /// if index === 0 ( it is first element in array ) then add class active 
                    if(index === 0){
                        return `<td><a class="table-refresh__link" href="#" onclick="getGameMoves('${itemData}'); return false;">${itemData}</a></td>`
                    }else{
                        return `<td>${itemData}</td>`
                    }
                }
            ).join("")}
                </tr>
            `)
        }

        //Clear the data to display
        while (dataToDisplay.rows.length > 0) {
            dataToDisplay.rows.pop();
        }
    }

    function disposeTable(){
        let x = document.getElementById('game_moves')
        x.style.display = 'none'
        let y = document.getElementById('gameMovesButton')
        y.style.display = 'none'
        let z = document.getElementById('gameMovesLabel')
        z.style.display = 'none'
    }

    function clearTable(){
        $('#game_moves').find('tbody').empty()
    }
}