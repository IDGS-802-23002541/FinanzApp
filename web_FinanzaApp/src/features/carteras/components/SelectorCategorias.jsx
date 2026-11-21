// archivo: web_FinanzaApp/src/features/carteras/components/SelectorCategorias.jsx
import { useEffect, useState } from 'react'
import { Alert, Autocomplete, TextField } from '@mui/material'
import { crearCategoria, listarCategorias } from '../api.js'

// Opcion falsa que aparece cuando el texto escrito no existe todavia.
function opcionNueva(nombre) {
  return { idCategoria: `nueva:${nombre}`, nombre, nueva: true }
}

// Filtra por nombre y agrega la opcion de crear si no hay coincidencia exacta.
function filtrarCategorias(opciones, { inputValue }) {
  const texto = inputValue.trim().toLowerCase()
  const filtradas = texto
    ? opciones.filter((opcion) => opcion.nombre.toLowerCase().includes(texto))
    : opciones

  const existe = opciones.some(
    (opcion) => opcion.nombre.toLowerCase() === texto,
  )

  if (texto && !existe) return [...filtradas, opcionNueva(inputValue.trim())]
  return filtradas
}

// Selector de categorias de una cartera (HU-05.4): busca y crea al vuelo.
function SelectorCategorias({ idCartera, tipo, value, onChange }) {
    const [opciones, setOpciones] = useState([])
    const [cargando, setCargando] = useState(false)
    const [creando, setCreando] = useState(false)
    const [error, setError] = useState('')

    // Recarga las categorias cada vez que cambia la cartera o el tipo.
  useEffect(() => {
    let vigente = true

    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const categorias = await listarCategorias(idCartera, tipo)
        if (vigente) setOpciones(categorias)
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
},[idCartera, tipo])

// crea la categoria nueva, refresca la lista y deja seleccionada la nueva 
const crearAlVuelo = async (nombre) => {
    setCreando(true)
    setError('')
    try{
    const nueva = await crearCategoria(idCartera,{nombre, tipo})
    const categorias = await listarCategorias(idCartera, tipo)
    setOpciones(categorias)
    onChange(nueva.idCategoria)
    }catch(err){
        setError(err.message)
    }finally{
        setCreando(false)
    }
}

const seleccionada = opciones.find((opcion) => opcion.idCategoria === value) ?? null 

const cambiar = (_evento, opcion) => {
    if(!opcion){
        onChange(null)
        return
    }
    if(opcion.nueva){
        crearAlVuelo(opcion.nombre)
        return
    }

    onChange(opcion.idCategoria)
}

return (
    <>
        <Autocomplete
        size='small'
        options={opciones}
        value={seleccionada}
        onChange={cambiar}
        loading={cargando || creando}
        filterOptions={filtrarCategorias}
        getOptionLabel={(opcion) => opcion.nombre}
        isOptionEqualToValue={(opcion, valor) => opcion.idCategoria === valor.idCategoria}
        noOptionsText="Escribe para crear una categoria"
        renderOption={(props, opcion) => {
            const {key, ...otros} = props 
            return (
                <li key={key} {...otros}>
                    {opcion.nueva ? `Crear "${opcion.nombre}"` : opcion.nombre}
                </li>
            )
        }}

        renderInput={(params) => (
            <TextField
            {...params}
            label="Categoria"
            placeholder='Buscar o escribir una nueva'
            />
        )}
        />
        {error && (
            <Alert severity='error' sx={{ mt:1}}>
                {error}
            </Alert>
        )}
    </>
    )
}
export default SelectorCategorias