const {client, createTables, createCustomer, createRestaurant, fetchCustomers,
    fetchRestaurants, fetchReservations, createReservation, } = require ("./db")

const express = require ('express')

const server = express();

server.use(express.json());

server.get("/api/customers", async (req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (error) {
        next(error)
    }
});

server.get("/api/restaurants", async (req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (error) {
        next(error)
    }
});

server.get("/api/reservations", async (req, res, next) => {
    try {
        const reservation = await fetchReservations(req.body)
        res.status(201).send(reservation)
    } catch (error) {
        next(error)
    }
});

// server.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
//     try {
//         const {customer_id, id} = req.params
//         await destroyReservation({customer_id, id});

//         res.sendStatus(204);
//     } catch (error) {
//         next(error)
//     }
// }); 

server.post("/api/customers/:id/reservations", async (req, res, next) => {
    try {
        res.send(await createReservation());
    } catch (error) {
        next(error)
    }
});



server.use((err, req, res)=> {
    res.status(err.status || 500).send({err});
});

const init = async () => {
    await client.connect();
    console.log("client connected")

    await createTables();
    console.log("tables created");

    const [mark, bob, wade, eggs, sweet, OB] = await Promise.all([
        createCustomer({name: "Mark"}),
        createCustomer({name: "Bob"}),
        createCustomer({name: "Wade"}),
        createRestaurant ({name:"Eggspectations"}),
        createRestaurant ({name:"Sweet Water"}),
        createRestaurant ({name:"Outback"})
    ]);
    console.log("Mark:", mark)
    console.log("Outback:", OB)
    console.log('tables seeded')

    const customers = await fetchCustomers();
    console.log('customers', customers)

    const restaurants = await fetchRestaurants();
    console.log('restaurants', restaurants)

 

    const [res1, res2] = await Promise.all([
        createReservation({
            customer_id: mark.id,
            restaurant_id: sweet.id,
            party_count: 6,
            date: "7-21-2024", 
        }),
        createReservation({
            customer_id: wade.id,
            restaurant_id: OB.id,
            party_count: 3,
            date: "7-21-2024", 
        }),
    ]);
    console.log('reservation for mark:', res1);
    console.log('reservation for wade:', res2);

    //await destroyReservation({ id: res1.id, customer_id: mark.id});
    const res = await fetchReservations();
    console.log("reservations", res)

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
    
};



init();