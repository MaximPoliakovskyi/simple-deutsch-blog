import React from 'react'

export default function Footer() {
	return (
		<footer className="bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
			<div className="container mx-auto px-4 py-16">
				<div className="w-full">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">LEARN</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/courses" className="hover:underline">Courses</a></li>
								<li><a href="/lessons" className="hover:underline">Lessons</a></li>
								<li><a href="/exercises" className="hover:underline">Exercises &amp; Tests</a></li>
								<li><a href="/certificates" className="hover:underline">Certificates</a></li>
								<li><a href="/learning-paths" className="hover:underline">Learning Paths</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">FOR BUSINESS &amp; SCHOOLS</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/business" className="hover:underline">Business Solutions</a></li>
								<li><a href="/schools" className="hover:underline">Solutions for Schools</a></li>
								<li><a href="/pricing" className="hover:underline">Pricing</a></li>
								<li><a href="/enterprise" className="hover:underline">Enterprise</a></li>
							</ul>
						</div>

						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">COURSES &amp; LEVELS</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/levels/a1" className="hover:underline">A1 - Beginner</a></li>
								<li><a href="/levels/a2" className="hover:underline">A2 - Elementary</a></li>
								<li><a href="/levels/b1" className="hover:underline">B1 - Intermediate</a></li>
								<li><a href="/levels/b2" className="hover:underline">B2 - Upper Intermediate</a></li>
								<li><a href="/conversation" className="hover:underline">Conversation Courses</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">RESOURCES</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/blog" className="hover:underline">Blog</a></li>
								<li><a href="/podcast" className="hover:underline">Podcast</a></li>
								<li><a href="/faq" className="hover:underline">FAQ</a></li>
								<li><a href="/help" className="hover:underline">Help &amp; Support</a></li>
								<li><a href="/community" className="hover:underline">Community</a></li>
							</ul>
						</div>

						<div>
							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mb-6">COMPANY</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/about" className="hover:underline">About</a></li>
								<li><a href="/team" className="hover:underline">Team</a></li>
								<li><a href="/careers" className="hover:underline">Careers</a></li>
								<li><a href="/press" className="hover:underline">Press</a></li>
							</ul>

							<h4 className="text-sm tracking-widest text-slate-400 dark:text-slate-400 mt-8 mb-6">LEGAL &amp; CONTACT</h4>
							<ul className="space-y-4 text-base text-slate-700 dark:text-slate-300">
								<li><a href="/imprint" className="hover:underline">Imprint</a></li>
								<li><a href="/privacy" className="hover:underline">Privacy</a></li>
								<li><a href="/terms" className="hover:underline">Terms</a></li>
								<li><a href="/contact" className="hover:underline">Contact</a></li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom bar: copyright left */}
				<div className="mt-12 pt-6 text-sm text-slate-500 dark:text-slate-400">
					<div>© {new Date().getFullYear()} Simple Deutsch</div>
				</div>
			</div>
		</footer>
	)
}
