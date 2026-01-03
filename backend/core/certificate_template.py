def get_certificate_html(student_name, course_name, issue_date, certificate_id):
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate - {student_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Montserrat', sans-serif; }}
    .heading-font {{ font-family: 'Playfair Display', serif; }}
  </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">

  <!-- Certificate Container -->
  <div class="relative w-[1123px] h-[794px] bg-[#f2f3f7] border-[10px] border-[#3b1d63] shadow-2xl overflow-hidden mx-auto">

    <!-- Corners -->
    <div class="absolute top-0 left-0 w-32 h-32 bg-[#3b1d63] clip-path-diagonal" style="clip-path: polygon(0 0, 100% 0, 0 100%);"></div>
    <div class="absolute bottom-0 right-0 w-32 h-32 bg-[#3b1d63]" style="clip-path: polygon(100% 0, 100% 100%, 0 100%);"></div>
    <div class="absolute top-0 right-0 w-28 h-28 bg-[#d4a74d]" style="clip-path: polygon(100% 0, 0 0, 100% 100%);"></div>
    <div class="absolute bottom-0 left-0 w-28 h-28 bg-[#d4a74d]" style="clip-path: polygon(0 100%, 0 0, 100% 100%);"></div>

    <div class="relative z-10 px-20 py-14 h-full flex flex-col justify-between text-center">
      
      <!-- Header -->
      <div>
        <p class="text-gray-500 font-semibold text-sm">Certificate ID: {certificate_id}</p>
        <h1 class="text-3xl font-bold text-blue-700 uppercase mt-2">SkillChaska</h1>
        <p class="text-gray-700 text-base">Vasai Road (W), Dist-Palghar</p>
      </div>

      <!-- Title -->
      <div class="mt-4">
        <h2 class="heading-font text-5xl tracking-wide uppercase text-gray-800">Certificate of Achievement</h2>
        <div class="flex justify-center mt-4">
          <div class="w-24 h-[3px] bg-purple-700"></div>
        </div>
      </div>

      <!-- Presented To (DYNAMIC NAME) -->
      <div class="mt-2">
        <p class="uppercase tracking-widest text-sm text-gray-700 mb-4">This Certificate Is Presented To</p>
        
        <!-- INJECTED NAME -->
        <h1 class="heading-font text-5xl font-bold text-[#3b1d63] capitalize mb-2">{student_name}</h1>
        
        <div class="border-b-2 border-purple-700 w-2/3 mx-auto"></div>
      </div>

      <!-- Description (DYNAMIC COURSE) -->
      <div class="mt-6 px-20">
        <p class="text-xl text-gray-800 leading-relaxed">
          For successfully completing the course <br>
          <span class="font-bold text-2xl text-[#d4a74d] block mt-2 mb-2">"{course_name}"</span>
          and demonstrating commendable dedication and achievement throughout the program.
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-8 flex items-end justify-between px-10">
        <div class="text-left">
          <div class="w-40 border-b border-gray-700 mb-2"></div>
          <p class="font-semibold">Mr. John</p>
          <p class="text-sm text-gray-600">Coordinator</p>
        </div>

        <div>
           <!-- Seal Placeholder -->
          <div class="w-24 h-24 border-4 border-[#d4a74d] rounded-full flex items-center justify-center text-xs font-bold text-[#3b1d63] shadow-lg">
            SKILL<br>CHASKA<br>SEAL
          </div>
        </div>

        <div class="text-right">
          <p class="mb-2 font-semibold text-gray-600">{issue_date}</p>
          <div class="w-40 border-b border-gray-700 mb-2"></div>
          <p class="font-semibold">Mr. Sena</p>
          <p class="text-sm text-gray-600">CEO</p>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
"""