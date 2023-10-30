import Image from "next/image";
import { HomeContainer, Product } from "../styles/pages/home";
import { useKeenSlider } from 'keen-slider/react'

import "keen-slider/keen-slider.min.css";
import { GetServerSideProps } from "next";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import Link from "next/link";


interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  }[]
}

export default function Home( {products}: HomeProps) {

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 45
    },
  })

  return (
    <HomeContainer ref={sliderRef} className="keen-slider">
      {
        products.map((product) => (
          <Link   key={product.id}  href={`/product/${product.id}`} prefetch={false}>
          <Product className="keen-slider__slide">
            <Image  placeholder="empty" src={product.imageUrl[0]}  layout="fill" alt="product"/>
            <footer>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </footer>
          </Product>
          </Link>
        ))
      }
     
    </HomeContainer>
  )
}
export const getStaticProps = async () => {

  const response = await stripe.products.list(
    {
      expand: ['data.default_price']
    }
  ) 

  //remove the products that not start with name camisa
  const filteredDAta = response.data.filter((product) => {
    return product.name.toLowerCase().startsWith('camisa')
  }
  )


  const products = filteredDAta.map((product) => {
    const price = product.default_price as Stripe.Price;

    if (!price) return null;

    //formate price to BRL
    

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images,
      url: product.url,
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price.unit_amount / 100)
    };
  });
  //set revaidade to 1 hour
  
  return {
    revalidate: 60 * 60 * 1, //24 hours
    props: {
      products
    },
  }
}