{
    function getParameter(value){
        return value = game
    }

    async function updateTable(root){

        root.querySelector('.table-refresh__button').classList.add("table-refresh__button-refreshing")
        const table = root.querySelector('.table-refresh__table')
        const response = await fetch(root.dataset.url)
        const data = await response.json()

        console.log(data)

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
        /*for(const row of data.rows){
            table.querySelector("tbody").insertAdjacentHTML("beforeend",`
                <tr>${row.map(col => `<td>${col}</td>`).join("")}
                </tr>
            `)
        }*/

    }

    for(const root of document.querySelectorAll(".table-refresh[data-url]")){
        const table = document.createElement('table')
        const options = document.createElement('div')

        table.classList.add('table-refresh__table')
        options.classList.add('table-refresh__options')

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

        options.innerHTML = `
            <span class="table-refresh__label">Last Update: never</span>
            <button type="button" class="table-refresh__button">
            <i class="material-icons">refresh</i>
            </button>                
        `;

        root.append(table, options)

        options.querySelector(".table-refresh__button").addEventListener("click", () => {
            //updateTable(root)
        })

        console.log("Parameter: " + getParameter())

        //updateTable(root)
    }

}