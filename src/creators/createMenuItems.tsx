import Divider from "@mui/material/Divider"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import MenuItem from "@mui/material/MenuItem"
import Typography from "@mui/material/Typography"

// eslint-disable-next-line functional/no-mixed-type
export interface MenuItemOption {
  name?: string
  icon?: JSX.Element
  sub?: string
  onClick?: () => void
  divider?: boolean
}
export function createMenuItems(items: MenuItemOption[]) {
  return items.map((item, index) => {
    if (item.divider) return <Divider key={index} />

    return (
      <MenuItem key={index} onClick={item.onClick}>
        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
        <ListItemText
          sx={{
            fontSize: 14
          }}
          disableTypography
        >
          {item.name}
        </ListItemText>
        {item.sub && (
          <Typography variant="body2" color="text.secondary" ml={2}>
            {item.sub}
          </Typography>
        )}
      </MenuItem>
    )
  })
}
