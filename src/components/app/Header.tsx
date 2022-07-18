import { Button } from "../ui/Button"
import "./Header.scss"

export function Header() {
  return (
    <header className="h-[42px] w-full top-0 left-0 flex items-center px-3">
      <Button
        label="File"
        submenu={[
          {
            title: "New"
          },
          {
            title: "Save",
            subtitle: "⌃+S"
          },
          {
            title: "Examples"
          }
        ]}
      />
      <Button
        label="Edit"
        submenu={[
          {
            title: "Prettier"
          },
          {
            title: "Find"
          },
          {
            title: "Replace"
          }
        ]}
      />
      <Button label="Sketch" />
      <Button label="Help" />

      <div className="flex-1"></div>

      <Button label="English" />
      <Button label="Login in" />
      <span className="text-gray-300 text-[12px]">or</span>
      <Button label="Sign up" />
    </header>
  )
}
