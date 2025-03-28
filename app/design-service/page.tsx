// app/design-service/page.tsx
export default function DesignServicePage() {
  return (
    <section>
      <h1 className='text-2xl font-bold mb-4'>Design Services</h1>
      <p>
        Our design services provide custom integrated circuit (IC) solutions
        from concept to mass production.
      </p>
      <ul className='list-disc ml-5 mt-4'>
        <li>Full-Custom IC Design</li>
        <li>Analog & Digital Mixed Signal Solutions</li>
        <li>Low-Power SoC Architectures</li>
        <li>DFT and Verification Services</li>
      </ul>
      <p className='mt-4'>
        Whether you need a simple microcontroller or a complex System on Chip
        (SoC) for advanced AI and machine learning applications, our team is
        here to help.
      </p>
    </section>
  )
}
