import "./Button.scss"
import { Component } from "react"

interface Props {
  label?: string
  submenu?: {
    title: string
    subtitle?: string
  }[]
  class?: string
}
export class Button extends Component<
  Props,
  {
    opened: boolean
  }
> {
  constructor(props: Props) {
    super(props)
    this.state = {
      opened: false
    }
  }

  private handleGlobalClick?: (event: Event) => void
  componentDidMount() {
    const handleGlobalClick = (event: Event) => {
      if (
        this.state.opened &&
        this.base !== event.target &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        !this.base?.contains(event.target! as HTMLElement)
      ) {
        this.setState({
          opened: false
        })
      }
    }
    document.addEventListener("click", handleGlobalClick)

    this.handleGlobalClick = handleGlobalClick
  }

  componentWillUnmount() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.removeEventListener("click", this.handleGlobalClick!)
  }

  render() {
    const submenu = this.props.submenu && (
      <ul
        className={
          "absolute bg-[#333] border-[#666] rounded overflow-hidden shadow-indigo-600 top-[100%] min-w-[120px] max-w-[100vw] breaks-word z-10 " +
          (this.state.opened ? "" : "hidden")
        }
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {this.props.submenu.map((item) => (
          <li key={item}>
            <button className="btn px-[16px] py-[8px] w-full text-left hover:bg-indigo-600">
              {item.title}
              {item.subtitle && (
                <span className="float-right text-[#a6a6a6]">{item.subtitle}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    )

    const onClick = () => {
      this.setState({
        opened: !this.state.opened
      })
    }

    return (
      <button
        className={"btn flex items-center relative " + (this.props.class ?? "")}
        onClick={onClick}
      >
        {this.props.label}
        {this.props.submenu && <IconBxChevronDown className="ml-1" />}

        {submenu}
        {this.props.children}
      </button>
    )
  }
}
