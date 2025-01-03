import { KAKAO_AUTH_URL } from '@/constants'
import Image from 'next/image'
import kakaoButton from './kakako-button.png'

interface KakaoLoginButtonProps {
  className?: string
  next?: string
}

const KakaoLoginButton = (props: KakaoLoginButtonProps) => {
  const onClick = () => {
    window.location.href = KAKAO_AUTH_URL + (props.next ? `&state=${props.next}` : '')
  }

  return (
    <button className={props.className || ''} type="button" onClick={onClick}>
      <Image src={kakaoButton} alt="Kakao" width={366} height={90} />
    </button>
  )
}

export default KakaoLoginButton
