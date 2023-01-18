import faker from 'faker'
faker.locale = 'es'

function crearProductoRandom() {
    return {
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        thumbnail: faker.image.imageUrl()
    }
}

const addRandomProducts = () =>{
    // const productosRandom = []
    // for (let i = 0; i < 5; i++) {
    //     productosRandom.push(crearProductoRandom())
    // }
    const newProduct = crearProductoRandom()
    return crearProductoRandom()
}

export default addRandomProducts;