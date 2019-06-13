import styled from '@emotion/styled'
import * as React from 'react'

export const Container = styled('div')(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'move',
  },
  ({ containerStyle }) => ({ ...containerStyle })
)

export const Img = styled('img')(
  {
    maxWidth: '100%',
    maxHeight: '100%',
    margin: 'auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    willChange: 'transform', // this improves performances and prevent painting issues on iOS Chrome
  },
  ({ imageStyle }) => ({ ...imageStyle })
)

const lineBorder = '1px solid rgba(255, 255, 255, 0.5)'
const cropperLines = {
  content: '" "',
  boxSizing: 'border-box',
  position: 'absolute',
  border: lineBorder,
}
const cropperArea = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  border: lineBorder,
  boxSizing: 'border-box',
  boxShadow: '0 0 0 9999em',
  color: 'rgba(0,0,0,0.5)',
  overflow: 'hidden',
}
const gridLines = {
  '&::before': {
    ...cropperLines,
    top: 0,
    bottom: 0,
    left: '33.33%',
    right: '33.33%',
    borderTop: 0,
    borderBottom: 0,
  },
  '&::after': {
    ...cropperLines,
    top: '33.33%',
    bottom: '33.33%',
    left: 0,
    right: 0,
    borderLeft: 0,
    borderRight: 0,
  },
}
const roundShape = {
  borderRadius: '50%',
}

const CropAreaDiv = styled('div')({}, ({ cropShape, showGrid, cropAreaStyle }) => ({
  ...(() => {
    switch (cropShape) {
      case 'round':
        return { ...cropperArea, ...roundShape }
      case 'rect':
      default:
        return cropperArea
    }
  })(),
  ...(showGrid ? gridLines : {}),
  ...cropAreaStyle,
}))

const DragArea = styled('div')(
  {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, .3)',
  },
  ({ direction }) => {
    const barThickness = 10
    if (direction === 'top') {
      return {
        top: -barThickness / 2,
        left: 0,
        right: 0,
        height: barThickness,
        cursor: 'ns-resize',
      }
    } else if (direction === 'left') {
      return {
        top: 0,
        bottom: 0,
        left: -barThickness / 2,
        width: barThickness,
        cursor: 'ew-resize',
      }
    } else if (direction === 'right') {
      return {
        top: 0,
        bottom: 0,
        right: -barThickness / 2,
        width: barThickness,
        cursor: 'ew-resize',
      }
    } else if (direction === 'bottom') {
      return {
        bottom: -barThickness / 2,
        left: 0,
        right: 0,
        height: barThickness,
        cursor: 'ns-resize',
      }
    }
  }
)

export const CropArea = ({ style, ...props }) => {
  const [startPosition, setStartPosition] = React.useState(null)
  const [currentPosition, setCurrentPosition] = React.useState(null)

  const onMouseDown = React.useCallback(
    (direction, e) => {
      e.stopPropagation()
      setStartPosition({ direction: direction, x: e.clientX, y: e.clientY })
    },
    [startPosition]
  )

  React.useEffect(() => {
    const onMouseUp = e => {
      setStartPosition(null)
      setCurrentPosition(null)
    }
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [startPosition])

  React.useEffect(() => {
    if (!startPosition) {
      return
    }
    const onMouseMove = e => {
      setCurrentPosition({
        x: e.clientX,
        y: e.clientY,
      })
    }
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [startPosition])

  let newStyle = style
  if (startPosition && currentPosition) {
    const { direction } = startPosition
    if (direction === 'left') {
      newStyle = {
        width: style.width - (currentPosition.x - startPosition.x) * 2,
        height: style.height,
      }
    } else if (direction === 'right') {
      newStyle = {
        width: style.width + (currentPosition.x - startPosition.x) * 2,
        height: style.height,
      }
    } else if (direction === 'top') {
      newStyle = {
        width: style.width,
        height: style.height - (currentPosition.y - startPosition.y) * 2,
      }
    } else if (direction === 'bottom') {
      newStyle = {
        width: style.width,
        height: style.height + (currentPosition.y - startPosition.y) * 2,
      }
    }
  }

  return (
    <CropAreaDiv style={newStyle} {...props}>
      {['top', 'bottom', 'left', 'right'].map(direction => {
        return (
          <DragArea
            key={direction}
            direction={direction}
            onMouseDown={onMouseDown.bind(null, direction)}
          />
        )
      })}
    </CropAreaDiv>
  )
}
