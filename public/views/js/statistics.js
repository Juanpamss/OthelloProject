{
    let username = JSON.parse(data).user
    let parsedJSON = JSON.parse(data).db
    let dataToDisplay = {
        rows: []
    }
    parsedJSON.forEach(function(message){
        dataToDisplay.rows.push(
            [
                message['USERNAME'],
                message['WON'],
                message['LOST'],
                message['DRAW'],
                message['TOTAL_PLAYED']
            ]
        )
    });

    let logedInUserStatistics = {
        data: []
    }

    parsedJSON.forEach(function(message){
        if(message['USERNAME'] == username){
            logedInUserStatistics = message
        }
    })

    console.log(logedInUserStatistics)

    async function updateTable(root){

        //root.querySelector('.table-refresh__button').classList.add("table-refresh__button-refreshing")
        const table = root.querySelector('.table-refresh__table_statistics')

        /*Clear table*/
        table.querySelector("thead tr").innerHTML = ""
        table.querySelector("tbody tr").innerHTML = ""

        const headers = {
            headers: ["Player", "Won", "Lost", "Draw", "Total Played"]
        }

        /*Populate headers*/
        for(const header of headers.headers){
            table.querySelector("thead tr").insertAdjacentHTML("beforeend",`<th>${header}</th>`)
        }

        /*Populate rows*/
        for(const row of dataToDisplay.rows){
            table.querySelector("tbody").insertAdjacentHTML("beforeend",`
                <tr>${row.map(col => `<td>${col}</td>`).join("")}
                </tr>
            `)
        }

        //Clear the data to display
        while (dataToDisplay.rows.length > 0) {
            dataToDisplay.rows.pop();
        }
    }

    /*Main Table*/
    for(const root of document.querySelectorAll(".table-refresh[data-url]")){
        const table = document.createElement('table')
        //const options = document.createElement('div')

        table.classList.add('table-refresh__table_statistics')
        //options.classList.add('table-refresh__options')

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

    var ctx = document.getElementById('chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Won', 'Lost', 'Draw'],
            datasets: [{
                label: 'My Statistics',
                data: [
                    logedInUserStatistics['WON'],
                    logedInUserStatistics['LOST'],
                    logedInUserStatistics['DRAW'],
                ],
                backgroundColor: [
                    'rgba(24, 210, 49, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(24, 210, 49, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 0
            }]
        },

    });

}