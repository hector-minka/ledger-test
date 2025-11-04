# 📝 Guía de Formateo para Notion

## 🎯 Instrucciones para Copiar a Notion

### Método 1: Copia Directa (Recomendado)

1. **Abre el archivo** `notion-native-format.md`
2. **Selecciona todo el contenido** (Ctrl+A / Cmd+A)
3. **Copia** (Ctrl+C / Cmd+C)
4. **Pega en Notion** - Notion debería detectar automáticamente el formato

### Método 2: Formateo Manual en Notion

Si Notion no formatea automáticamente, sigue estos pasos:

#### Para Títulos:

- **H1**: Selecciona el texto y usa `Ctrl+Alt+1` o el menú de formato
- **H2**: Selecciona el texto y usa `Ctrl+Alt+2`
- **H3**: Selecciona el texto y usa `Ctrl+Alt+3`

#### Para Código:

- **Bloques de código**: Selecciona el texto y usa `Ctrl+Shift+E` o el botón `</>`
- **Código inline**: Selecciona el texto y usa `Ctrl+Shift+E`

#### Para Listas:

- **Lista con viñetas**: Usa `-` al inicio de la línea
- **Lista numerada**: Usa `1.` al inicio de la línea
- **Lista de tareas**: Usa `- [ ]` para tareas pendientes, `- [x]` para completadas

#### Para Tablas:

- **Crear tabla**: Usa `/table` y selecciona el número de columnas
- **Agregar filas**: Usa `Tab` en la última celda
- **Agregar columnas**: Usa `Enter` en la última celda

#### Para Callouts (Cajas de información):

- **Crear callout**: Usa `/callout` y selecciona el tipo
- **Tipos recomendados**: `💡 Tip`, `⚠️ Warning`, `✅ Success`

---

## 🔧 Formateo Específico por Sección

### 1. Título Principal

```
🔐 Autenticación Minka - Guía Rápida
```

**Formato en Notion**: H1 con emoji

### 2. Subtítulos

```
## ⚡ Inicio Rápido
## 🔄 Flujo de Implementación
## 🚀 Ejemplo Completo
```

**Formato en Notion**: H2 con emoji

### 3. Subsecciones

```
### 1. Instalación
### 2. Generar archivo .der
### 3. Configuración
```

**Formato en Notion**: H3

### 4. Bloques de Código

````
```bash
npm install crypto @minka/ledger-sdk
````

```
**Formato en Notion**: Código con sintaxis highlighting

### 5. Tablas
```

| Error                               | Solución                                       |
| ----------------------------------- | ---------------------------------------------- |
| `Unexpected raw private key length` | Verificar que la clave tenga 64 caracteres hex |

```
**Formato en Notion**: Tabla con 2 columnas

### 6. Listas de Verificación
```

- ✅ Usar variables de entorno para datos sensibles
- ✅ Nunca hardcodear claves privadas
- ✅ Validar todos los datos de entrada

```
**Formato en Notion**: Lista de tareas completadas

### 7. Callouts
```

> **💡 Tip**: Este flujo asegura comunicación segura con la API de Minka

```
**Formato en Notion**: Callout de tipo "Tip"

---

## 🎨 Personalización Adicional

### Colores y Estilos
- **Texto importante**: Usa **negrita** o `código inline`
- **Enlaces**: Usa `[texto](url)` para enlaces
- **Citas**: Usa `>` para citas o callouts
- **Separadores**: Usa `---` para líneas divisorias

### Emojis Recomendados
- 🔐 Seguridad
- ⚡ Rápido
- 🔄 Proceso
- 🚀 Implementación
- 📊 Datos
- ⚠️ Advertencias
- ✅ Éxito
- 🧪 Testing
- 💡 Tips

### Estructura Recomendada
1. **Título principal** con emoji
2. **Resumen** breve
3. **Secciones** con subtítulos claros
4. **Código** con sintaxis highlighting
5. **Tablas** para referencias rápidas
6. **Callouts** para información importante
7. **Listas** para pasos y mejores prácticas

---

## 📋 Checklist de Formateo

- [ ] Títulos con jerarquía correcta (H1, H2, H3)
- [ ] Código con sintaxis highlighting apropiada
- [ ] Tablas con columnas alineadas
- [ ] Listas de verificación para mejores prácticas
- [ ] Callouts para tips y advertencias
- [ ] Emojis para mejorar la legibilidad
- [ ] Separadores entre secciones principales
- [ ] Enlaces funcionales (si los hay)
- [ ] Formato consistente en toda la documentación

---

## 🚀 Resultado Final

Una vez formateado correctamente en Notion, deberías tener:

- **Navegación clara** con títulos jerárquicos
- **Código legible** con sintaxis highlighting
- **Referencias rápidas** en tablas
- **Información destacada** en callouts
- **Pasos claros** en listas numeradas
- **Mejores prácticas** en listas de verificación
- **Diseño visual** atractivo con emojis

Esto creará una documentación profesional y fácil de usar en Notion.
```




















