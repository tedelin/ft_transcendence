import "../../styles/gameSettings.css"

export function Paddle() {
    return (
        <div className="paddle_setting">
            <div className="paddleSizeContainer">
                <p>Paddle Size </p>
                <div className="paddleSizeOutside">
                    <div className="paddleSizeInside"></div>
                </div>
            </div>
            {/* <p>settings Paddle</p> */}
        </div>
    )
}