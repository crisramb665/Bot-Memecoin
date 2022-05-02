// LO USÉ SOLO PARA TESTEAR, ESTE ARCHIVO NO SE USA PARA NADA!

(async function miPrograma(){
    // esta es una Promesa común y corriente
    let miPromesa = new Promise((resolve, reject) => {
      const lema = 'Viva Thanos';
      console.log(`El lema que voy a devolver es: "${lema}"`);
      return resolve(lema);
    });
  
  //intentaremos usar el resultado de nuestra promesa en una función:
  
    async function obtenerLema(promesa) {
      try {
        let lema = await promesa;
        console.log(`La promesa me devolvió: "${lema}"`);
        return lema;
      }
      catch(e) {
        console.error(e);
        throw e;
      }
    }
  
    try {
      const lemaObtenido = await obtenerLema(miPromesa);
      // ¿qué tiene lemaObtenido?
      console.log(lemaObtenido);
    }
    catch(e) {
      console.error(`Ocurrió un error: ${e.message}`);
    }
  })();